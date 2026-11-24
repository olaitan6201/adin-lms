<?php

namespace App\Services\Operations;

use DOMDocument;
use DOMElement;

final class ScormReader
{
    public const IMS = 'http://www.imsproject.org/xsd/imscp_rootv1p1p2';

    public const ADL = 'http://www.adlnet.org/xsd/adlcp_rootv1p2';

    /** @return list<array{title:string,file:string,links:array}> */
    public function chapters(string $xml): array
    {
        if ($xml === '' || str_contains($xml, '<!') || preg_match('/<\?(?!xml\s)|encoding\s*=\s*["\'](?!utf-8["\'])/i', $xml)) {
            TextAssetArchive::reject('Unsupported XML declaration or markup.');
        }
        $doc = new DOMDocument;
        if (! @$doc->loadXML($xml, LIBXML_NONET | LIBXML_NOERROR | LIBXML_NOWARNING)) {
            TextAssetArchive::reject('Malformed manifest.');
        }
        $root = $doc->documentElement;
        if ($root->localName !== 'manifest' || $root->namespaceURI !== self::IMS || $doc->doctype) {
            TextAssetArchive::reject('Expected an IMS SCORM 1.2 manifest.');
        }
        [$meta, $organizations, $resources] = $this->sequence($root, 'metadata', 'organizations', 'resources');
        [$schema, $version] = $this->sequence($meta, 'schema', 'schemaversion');
        if ($this->text($schema) !== 'ADL SCORM' || $this->text($version) !== '1.2') {
            TextAssetArchive::reject('Only SCORM 1.2 static assets are supported.');
        }
        [$org] = $this->sequence($organizations, 'organization');
        if ($organizations->getAttribute('default') !== $org->getAttribute('identifier')
            || ! in_array($org->getAttribute('structure'), ['', 'hierarchical'], true)) {
            TextAssetArchive::reject('Expected a single default organization.');
        }
        $files = [];
        foreach ($this->children($resources) as $resource) {
            [$file] = $this->sequence($resource, 'file');
            $id = $resource->getAttribute('identifier');
            $href = $resource->getAttribute('href');
            if ($resource->localName !== 'resource' || $resource->getAttribute('type') !== 'webcontent'
                || $resource->getAttributeNS(self::ADL, 'scormtype') !== 'asset' || $href !== $file->getAttribute('href')
                || $id === '' || isset($files[$id]) || $this->children($file)) {
                TextAssetArchive::reject('Unsupported resource: expected one local text asset per resource.');
            }
            $files[$id] = $href;
        }
        $items = $this->children($org);
        if (isset($items[0]) && $items[0]->localName === 'title') {
            $this->text(array_shift($items));
        }
        $chapters = [];
        foreach ($items as $item) {
            [$title] = $this->sequence($item, 'title');
            $ref = $item->getAttribute('identifierref');
            if ($item->localName !== 'item' || ! isset($files[$ref])) {
                TextAssetArchive::reject('Unsupported item or unresolved resource reference.');
            }
            $chapters[] = ['title' => $this->text($title), 'file' => $files[$ref], 'links' => []];
            unset($files[$ref]);
        }
        if ($files) {
            TextAssetArchive::reject('Unreferenced resources.');
        }

        return $chapters;
    }

    private function text(DOMElement $element): string
    {
        if ($this->children($element)) {
            TextAssetArchive::reject('Unsupported nested markup.');
        }

        return $element->textContent;
    }

    /** @return list<DOMElement> */
    private function children(DOMElement $element): array
    {
        $allowed = match ($element->localName) {
            'manifest' => ['identifier', 'version'],
            'organizations' => ['default'],
            'item' => ['identifier', 'identifierref'],
            'organization' => ['identifier', 'structure'],
            'resource' => ['identifier', 'type', 'href'],
            'file' => ['href'],
            default => [],
        };
        foreach ($element->attributes as $attribute) {
            if ($element->localName === 'resource' && $attribute->namespaceURI === self::ADL && $attribute->localName === 'scormtype') {
                continue;
            }
            if ($element->localName === 'manifest' && $attribute->namespaceURI === 'http://www.w3.org/2001/XMLSchema-instance' && $attribute->localName === 'schemaLocation') {
                continue;
            }
            if ($attribute->namespaceURI !== null || ! in_array($attribute->name, $allowed, true)) {
                TextAssetArchive::reject('Unsupported manifest attribute on '.$element->localName.'.');
            }
        }
        $children = [];
        foreach ($element->childNodes as $node) {
            if ($node instanceof DOMElement) {
                if ($node->namespaceURI !== self::IMS || $node->hasAttributeNS('http://www.w3.org/XML/1998/namespace', 'base')) {
                    TextAssetArchive::reject('Unsupported namespace or base location.');
                }
                $children[] = $node;
            }
        }

        return $children;
    }

    /** @return list<DOMElement> */
    private function sequence(DOMElement $element, string ...$names): array
    {
        $children = $this->children($element);
        if (array_map(fn ($child) => $child->localName, $children) !== $names) {
            TextAssetArchive::reject('Unsupported manifest activity or structure in '.$element->localName.'.');
        }

        return $children;
    }
}
