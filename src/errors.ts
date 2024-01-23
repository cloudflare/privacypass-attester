import { Context } from './context';
import { JSONResponse } from './utils/jsonResponse';

function shouldSendToSentry(error: Error): boolean {
	if (error instanceof PageNotFoundError || error instanceof MethodNotAllowedError) {
		return false;
	}
	return true;
}

export async function handleError(ctx: Context, error: Error) {
	console.error(error.stack);

	ctx.metrics.erroredRequestsTotal.inc({ env: ctx.env.ENVIRONMENT });

	const status = (error as HTTPError).status ?? 500;
	const message = error.message || 'Server Error';
	console.log(message);
	if (shouldSendToSentry(error)) {
		ctx.logger.captureException(error);
	}
	return new JSONResponse(
		{
			error: { reason: error.name, details: message },
		},
		{ status }
	);
}

export class HTTPError extends Error {
	status: number;

	constructor(message?: string, status = 500) {
		super(message);
		this.name = 'HTTPError';
		this.status = status;
	}
}

export class ChallengeFailedError extends HTTPError {
	static CODE = 'ERROR_CHALLENGE_FAILED_ERROR';
	code: string;

	constructor(message = 'Challenge Failed') {
		super(message, 403);
		this.name = 'ChallengeFailed';
		this.code = ChallengeFailedError.CODE;
	}
}

export class HeaderNotDefinedError extends HTTPError {
	static CODE = 'ERROR_HEADER_NOT_DEFINED';
	code: string;

	constructor(message = 'Header not defined') {
		super(message, 406);
		this.name = 'HeaderNotDefined';
		this.code = HeaderNotDefinedError.CODE;
	}
}

export class IssuerFetchError extends HTTPError {
	static CODE = 'ERROR_ISSUER_DIRECTORY_FETCH_FAILED';
	code: string;

	constructor(message = 'Issuer directory fetch failed') {
		super(message, 500);
		this.name = 'IssuerFetchError';
		this.code = IssuerFetchError.CODE;
	}
}

export class MethodNotAllowedError extends HTTPError {
	static CODE = 'ERROR_METHOD_NOT_ALLOWED';
	code: string;

	constructor(message = 'Method not allowed') {
		super(message, 405);
		this.name = 'MethodNotAllowed';
		this.code = MethodNotAllowedError.CODE;
	}
}

export class PageNotFoundError extends HTTPError {
	static CODE = 'ERROR_PAGE_NOT_FOUND';
	code: string;

	constructor(message = 'Page not found') {
		super(message, 404);
		this.name = 'PageNotFound';
		this.code = PageNotFoundError.CODE;
	}
}
