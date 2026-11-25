<?php

namespace App\Enums;

enum AuthenticationOutcome: string
{
    case PasswordFailed = 'password.failed';
    case PasswordAccepted = 'password.accepted';
    case InstitutionAccepted = 'oidc.accepted';
    case AuthenticatorIssued = 'mfa.issued';
    case AuthenticatorEnrolled = 'mfa.enrolled';
    case ChallengeAccepted = 'mfa.accepted';
    case ChallengeFailed = 'mfa.failed';
    case SessionExpired = 'session.expired';
    case SessionRevoked = 'session.revoked';
    case SignedOut = 'session.logout';
}
