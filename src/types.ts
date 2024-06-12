// Turnstile definitions are based off https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
export type TurnstileErrorCodes =
	| 'missing-input-secret'
	| 'invalid-input-secret'
	| 'missing-input-response'
	| 'invalid-input-response'
	| 'bad-request'
	| 'timeout-or-duplicate'
	| 'internal-error';

export interface TurnstileResponse {
	'success': boolean;
	'error-codes': TurnstileErrorCodes[];
	'challenge_ts'?: string;
	'hostname'?: string;
	'action'?: string;
	'cdata'?: string;
}

// TODO: potentially grab type definitions from @cloudflare/privacypass-ts across all privacypass- repos
export type IssuerConfigurationResponse = {
	'issuer-request-uri': string;
	'token-keys': IssuerTokenKey[];
};

export type AttesterConfigurationResponse = {
	[attester: string]: {
		'token-keys': IssuerTokenKey[];
	};
};

export type IssuerTokenKey = {
	'token-type': TokenType;
	'token-key': string;
	'token-key-legacy'?: string;
	'not-before'?: number;
};

// https://www.ietf.org/archive/id/draft-ietf-privacypass-protocol-10.html#name-token-type-registry-updates-2
// https://www.ietf.org/archive/id/draft-ietf-privacypass-rate-limit-tokens-02.html#name-iana-considerations
export enum TokenType {
	VOPRF = 0x0001,
	BlindRSA = 0x0002,
	RateLimitBlindRSAECDSA = 0x0003,
	RateLimitBlindRSAEd25519 = 0x0004,
}
