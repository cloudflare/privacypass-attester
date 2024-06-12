# privacypass-attester: Privacy Pass Attester

privacypass-attester is a service that provides [tokens](https://www.ietf.org/archive/id/draft-ietf-privacypass-protocol-14.html) to client able to solve a challenge. It provides an HTTP API to retrieve and validate a challenge,proxying token requests to a Privacy Pass Issuer.

Privacy Pass protocol is defined as an [IETF Draft](https://www.ietf.org/archive/id/draft-ietf-privacypass-protocol-14.html). The attester API is defined ad-hoc, and documented [below][#api-specification].

## Tables of Content

* [Features](#features)
* [Installation](#installation)
* [Usage](#usage)
* [API specification](#api-specification)
* [Security Considerations](#security-considerations)
* [FAQ](#faq)
* [License](#license)

## Features

* Privacy Pass Attester with Turnstile challenge
* Support for [all token types](https://www.ietf.org/archive/id/draft-ietf-privacypass-protocol-14.html#name-token-type-registry-updates) in draft 14
* Serverless deployment with Cloudflare Workers

## What's next

* Validate issuer response
* Validate token request
* Agree on an attester API with downstream deploy

## Installation

| Environment   | CLI Command   |
|:--------------|:--------------|
| Node.js (18+) | `npm install` |

[nvm](https://github.com/nvm-sh/nvm) is recommended to manage Node.js versioning. [nvm installation instructions](https://github.com/nvm-sh/nvm) to install nvm.

## Usage

This section focuses on how to roll out your own attester. It uses [Turnstile](https://developers.cloudflare.com/turnstile/) as an example attestation method.

### Overview

An attester aims to validate certain properties of a requesting client. In the case of Turnstile, the attester sends a client a Turnstile challenge, and validates the response sent by the client.

The attester has server side code, handling client requests, and code that runs on the client, handling challenge solving. Server code is placed in [src/index.ts](./src/index.ts), while the client code is in [src/client-html.ts](./src/client-html.ts).

For Turnstile, the server validates a Turnstile token sent by the client, which the client is a webpage containing a Turnstile Widget which token is sent to the server for validation.

> Note:
> The attester client does not send a Privacy Pass token directly. This is injected by the platform, such as the web browser or the Privacy Pass extension.

### Configuration

This attester is based on Cloudflare Workers. All configuration is held in [wrangler.toml](./wrangler.toml).
You should update

* `ISSUER_REQUEST_URL` to the URL of your issuer. You can deploy your own issuer with [cloudflare/privacypass-issuer](https://github.com/cloudflare/privacypass-issuer).

## API specification

The attester API is versioned with `/v1/` prepending API calls. This design decision allows for possible upgrades, and disambiguates this self-defined API from the standardised [IETF Issuer API](https://www.ietf.org/archive/id/draft-ietf-privacypass-protocol-14.html#name-issuance-protocol-for-publi).

### `GET /v1/private-token-attester-directory`

Return all issuer keys trusted by the attester. The call is similar to [`/.well-known/private-token-issuer-directory`](https://www.ietf.org/archive/id/draft-ietf-privacypass-protocol-10.html#section-4). As a client, it allows to select an attester that can deliver an issuer token trusted by the origin you are interacting with.

#### Request

* Headers: None

#### Response

* Status: 200
* Headers: `Content-Type: application/json``
* Body: ` { [issuerName: string]: "token-keys": []{ "token-type": number, "token-key": string, "not-before": number|undefined } } `

### `GET /v1/challenge`

Return a webpage meant to be open in a dedicated web context (new window, new tab). This page can perform arbitrary computation. Once the validation is complete, a call is made to `POST /v1/challenge` with necessary data serialised in `Private-Token-Attester-Data`. This concludes the attestation sequence.

#### Request

* Headers: None

#### Response

* Status: 200
* Headers: `Content-Type: text/html`
* Body: Orchestration for your attestation method

### `POST /v1/challenge`

If the challenge response is correct, return a token signed by the requested issuer. The attestation webpage shares data with the attester via `Private-Token-Attester-Data` header. Response content type is defined in [IETF spec](https://www.ietf.org/archive/id/draft-ietf-privacypass-protocol-14.html#name-application-private-token-re).

#### Request

* Headers: `Private-Token-Attester-Data`
* Body: Token request as defined in [Privacy Pass Protocol, Section 6.1](https://www.ietf.org/archive/id/draft-ietf-privacypass-protocol-14.html#name-client-to-issuer-request-2)

#### Response

_If the challenge has been solved_

* Status: 200
* Headers: `Content-Type: application/private-token-response`
* Body: Serialized TokenResponse as defined in [Privacy Pass Protocol, Section 6.2](https://www.ietf.org/archive/id/draft-ietf-privacypass-protocol-14.html#name-issuer-to-client-response-2)

_If the challenge failed_

* Status: 403
* Body: Error message

## Security Considerations

This software has not been audited. Please use at your sole discretion. With this in mind, privacypass-attester security relies on the following:

* [Privacy Pass](https://www.ietf.org/archive/id/draft-ietf-privacypass-protocol-14.html) protocol, and its implementation in [cloudflare/privacypass-ts](https://github.com/cloudflare/privacypass-ts),
* [VOPRF](https://datatracker.ietf.org/doc/draft-irtf-cfrg-voprf/) by A. Davidson , A. Faz-Hernandez , N. Sullivan , C. Wood, its implementation in [cloudflare/voprf-ts](https://github.com/cloudflare/voprf-ts),
* [Blind RSA](https://datatracker.ietf.org/doc/draft-irtf-cfrg-rsa-blind-signatures/) by F. Denis , F. Jacobs , C. Wood, its implementation in [cloudflare/blindrsa-ts](https://github.com/cloudflare/blindrsa-ts),

## FAQ

### What attestation method are supported?

This repository demonstrate a [Turnstile] based attestation method. Should you have a new attestation method, requiring user interactivity or not, you can likely implement it as a dedicated attester. Please refer to the [usage](#usage) section.

### Which issuers are supported?

Any issuer accessible via HTTP is supported. You might need to implement an authentication mechanism, such as a Bearer token, mTLS, or others. Regarding token type, no check is performed by this attester on the correctness of the response returned by the issuer, leading to all token types being supported.

### How can the attester provide tokens for more than one issuer?

In Privacy Pass protocol, when prompted by an origin, a client (phone, laptop, fridge, others) contacts an attester to retrieve an issuer token. The origin trusts the issuer, and the client trusts the attester.

The same attester might be able to deliver token for multiple issuers. This means that they have out-of-band agreement with said issuer to send them token request.

An attester returns the list of issuer they support in `/v1/private-token-attester-directory`.

> Note:
> The present implementation only supports one issuer per attester. You should feel free to extend it to support your use case.

### Why define an ad-hoc attester API?

As specified by IETF, Privacy Pass protocol does not impose any constraint on the attester. In fact, there are no documentation about their interaction with the client or the issuer. The attester can be considered a custom authentication mechasnism against the issuer, with some additional privacy guarantees.

This repository aims to provide a baseline for people looking to deploy new attestation method. These could be rolled out standalone, or as part as a new client/issuer implementation. The wish in documenting the API used by the attester is it facilitates the development and deployments of a rich attester ecosystems.

The specificities of the present definition, appart from naming considerations, are the presence of an attester directory, and the inability for client to select a specific issuer more precisely than with the 8-bit of the token key present in the token request. An attester directory allows client to know if a given attester supports the issuer they are looking for before completing their challenge. The issuer selection only relying on the 8 least signifiacant bit aims to preserve the privacy property defined in [Privacy Pass Protocol, Section 6.1](https://www.ietf.org/archive/id/draft-ietf-privacypass-protocol-14.html#section-6.1-7.2).

## License

This project is under the Apache license.

### Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you shall be Apache licensed as above, without any additional terms or conditions.