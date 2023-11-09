export interface Bindings {
	// variables and secrets
	ENVIRONMENT: string;
	LOGGING_SHIM_TOKEN: string;
	ISSUER_DIRECTORY_URL: string;
	ISSUER_REQUEST_URL: string;
	SENTRY_ACCESS_CLIENT_ID: string;
	SENTRY_ACCESS_CLIENT_SECRET: string;
	SENTRY_DSN: string;
	SENTRY_SAMPLE_RATE: string;
	TURNSTILE_PUBLIC_KEY: string;
	TURNSTILE_SECRET_KEY: string;
	TURNSTILE_VERIFICATION_URL: string;

	// Service Bindings
	ISSUER: Fetcher;
}
