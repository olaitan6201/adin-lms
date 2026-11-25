<?php

namespace Tests\Feature\Integrations;

use Database\Seeders\AuthoritySeeder;
use Database\Seeders\DemoStaffAuthoritySeeder;
use Firebase\JWT\JWK;
use Firebase\JWT\JWT;
use Illuminate\Support\Str;
use Tests\Feature\Learning\LearningTestCase;

final class LtiContractTest extends LearningTestCase
{
    private string $file;

    protected function setUp(): void
    {
        parent::setUp();
        config(['cache.default' => 'database']);
        $this->file = tempnam(sys_get_temp_dir(), 'lti-fixture-');
        openssl_pkey_export_to_file((new PartnerKey)->key, $this->file);
        config(['integrations.issuer' => 'https://platform.example.test', 'integrations.private_key_file' => $this->file,
            'integrations.kid' => 'fixture', 'integrations.tools' => ['reader' => [
                'label' => 'Reader', 'url' => 'https://tool.example.test/read', 'login' => 'https://tool.example.test/login',
                'redirect' => 'https://tool.example.test/launch', 'client' => 'reader-client', 'deployment' => 'campus',
                'roles' => ['learner'], 'offerings' => [$this->offering->external_offering_id],
            ]]]);
        $this->actingAs($this->learner);
    }

    protected function tearDown(): void
    {
        if (isset($this->file)) {
            unlink($this->file);
        }

        parent::tearDown();
    }

    private function authorization(array $overrides = []): string
    {
        $redirect = $this->get(route('integrations.launch', [$this->offering, 'reader']))->assertRedirect()
            ->headers->get('Location');
        $this->assertSame('https://tool.example.test/login', explode('?', $redirect)[0]);
        parse_str(parse_url($redirect, PHP_URL_QUERY), $params);
        $this->assertSame('https://platform.example.test', $params['iss']);

        return route('integrations.lti.authorize', $overrides + [
            'login_hint' => $params['login_hint'], 'client_id' => $params['client_id'], 'scope' => 'openid',
            'prompt' => 'none', 'response_type' => 'id_token', 'response_mode' => 'form_post',
            'state' => 'fixture-state', 'nonce' => Str::random(32), 'redirect_uri' => 'https://tool.example.test/launch',
        ]);
    }

    public function test_tool_consumes_signed_form_and_platform_denies_replay_and_extra_services(): void
    {
        $url = $this->authorization(['nonce' => 'partner-challenge']);
        $response = $this->get($url)->assertOk();
        $html = new \DOMDocument;
        $html->loadHTML($response->getContent(), LIBXML_NOERROR | LIBXML_NONET);
        $xpath = new \DOMXPath($html);
        $this->assertSame('post', $xpath->evaluate('string(//form/@method)'));
        $this->assertSame('https://tool.example.test/launch', $xpath->evaluate('string(//form/@action)'));
        $this->assertSame('fixture-state', $xpath->evaluate('string(//input[@name="state"]/@value)'));
        $jwt = $xpath->evaluate('string(//input[@name="id_token"]/@value)');
        $keys = $this->getJson(route('integrations.lti.keys'))->assertOk()->json();
        $claims = (array) JWT::decode($jwt, JWK::parseKeySet($keys));
        $prefix = 'https://purl.imsglobal.org/spec/lti/claim/';
        $this->assertSame('reader-client', $claims['aud']);
        $this->assertSame('https://platform.example.test', $claims['iss']);
        $this->assertSame('partner-challenge', $claims['nonce']);
        $this->assertSame('campus', $claims[$prefix.'deployment_id']);
        $this->assertSame('LtiResourceLinkRequest', $claims[$prefix.'message_type']);
        $this->assertSame(['http://purl.imsglobal.org/vocab/lis/v2/membership#Learner'], $claims[$prefix.'roles']);
        $this->assertNotSame($this->learner->id, $claims['sub']);
        $this->assertArrayNotHasKey('email', $claims);
        $this->assertArrayNotHasKey('name', $claims);
        $this->get($url)->assertForbidden();
        $this->get($this->authorization(['nonce' => 'partner-challenge']))->assertForbidden();
        $this->post('/integrations/lti/token')->assertNotFound();
    }

    public function test_tool_registration_and_live_roster_are_rechecked_before_signing(): void
    {
        foreach (['client_id' => 'other', 'redirect_uri' => 'https://other.example.test/launch',
            'scope' => 'openid namesroles', 'response_type' => 'code', 'state' => '', 'nonce' => ''] as $key => $value) {
            $this->get($this->authorization([$key => $value]))->assertForbidden();
        }

        $url = $this->authorization();
        $this->withdraw();
        $this->get($url)->assertNotFound();
    }

    public function test_instructor_launch_needs_allocation_and_scoped_grant_and_hint_expires(): void
    {
        config(['integrations.tools.reader.roles' => ['instructor']]);
        $this->actingAs($this->teacher)->get(route('integrations.launch', [$this->offering, 'reader']))->assertNotFound();
        $this->seed(AuthoritySeeder::class);
        $this->seed(DemoStaffAuthoritySeeder::class);
        $this->actingAs($this->teacher->fresh())->withSession(['security.mfa_user' => $this->teacher->id]);
        $url = $this->authorization();
        $token = $this->get($url)->assertOk()->viewData('token');
        $keys = $this->getJson(route('integrations.lti.keys'))->assertOk()->json();
        $claims = (array) JWT::decode($token, JWK::parseKeySet($keys));
        $this->assertSame(['http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor'],
            $claims['https://purl.imsglobal.org/spec/lti/claim/roles']);
        $url = $this->authorization();
        $this->travel(4)->minutes();
        $this->get($url)->assertForbidden();
    }
}
