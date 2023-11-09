// TODO
// 1. string interpolation for
//	 <div class="cf-turnstile" data-sitekey="${ctx.env.TURNSTILE_PUBLIC_KEY}" data-callback="fetchToken"></div>
// 2. perhaps add Turnstile site key to Workers environment

import { Context } from './context';

export const generateHTML = (ctx: Context, request: Request) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">

<title>Cloudflare Research | Privacy Pass</title>

<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>

<script>

  window.fetchToken = function( token ) {

    document.getElementById( 'a2' ).classList.toggle( 'hidden' )

    // trigger the correct class on the sidebar
    const b2 = document.getElementById( 'b2' )
    b2.classList.remove( 'current' )
    b2.classList.add( 'box' )
    const b3 = document.getElementById( 'b3' )
    b3.classList.remove( 'box' )
    b3.classList.add( 'current' )

   	// call endpoint on attester to verify validity of token
    fetch( '${request.url}', {
        method: 'POST',
        headers: {
            'private-token-attester-data': token
        }
    } )

    console.log( 'sent fetch with a private-token-attester-data header' )

    document.getElementById( 'a3' ).classList.remove( 'hidden' )
    document.getElementById( 'snt' ).classList.remove( 'hidden' )
    document.getElementById( 'b4' ).firstElementChild.classList.add( 'green' )

  }

</script>

<link href="https://research.cloudflare.com/css/standalone1.css" rel="stylesheet" type="text/css">

<style type="text/css">
  .header { border-bottom: 0 }
  main { padding-right: 2rem; padding-bottom: 2rem }
  .q {
  	text-decoration: none;  	
    border: 1px solid var(--indigo-8);
    background-color: var(--indigo-9);
    padding: 0 0.2rem 0 0.2rem;
    color: black;
  }
  .q:hover {
    cursor: help;
  	text-decoration: none;
  	border: 1px solid var(--green-8);
    background-color: var(--green-9);
  }
  .q:visited {
    color: black;
  }
  .current {
  	display: table;
  	background-color: var(--orange-8);
  	border: 1px solid var(--orange-7);
  	margin-bottom: 0.2rem;
  }
  .current .num {
    margin-left: -1rem; 
    padding: 1rem 0.8rem 1rem 0.8rem; 
    background-color:var(--orange-7); 
    margin-right: 0.8rem;
  }  
  div.action {
    position: relative;
    border-radius: 1rem;
    background-color: var(--violet-9);
  	border: 1px solid var(--violet-7);
  	padding: 0.5rem 1rem 0.5rem 1.5rem;
  	margin-bottom: 0.2rem;
    margin-top: -1rem;
    margin-left: 1.8rem;
  }
  div.error {
    position: relative;
    border-radius: 1rem;
    color: white;
    background-color: var(--indigo-2);
  	border: 1px solid var(--indigo-1);
  	padding: 0.5rem 1rem 0.5rem 1.5rem;
  	margin-bottom: 0.2rem;
    margin-top: -1rem;
    margin-left: 1.7rem;  	
  }
  div.error a {
  	color: white;
  }  
  .box {
  	display: table;
  	background-color: white;
  	border: 1px solid var(--orange-8);
  	margin-bottom: 0.2rem;
  }
  .box .num {
    margin-left: -1rem; 
    padding: 1rem 0.8rem 1rem 0.8rem; 
    background-color:var(--orange-8); 
    margin-right: 0.8rem;
  }
  .snt {
    margin-top: 0rem;
    margin-right: -1rem;
  	float: right; 
  	background-color: green; 
  	color: white; 
  	width: 2.4rem;
  	height: 3rem; 
  	display: flex; 
  	justify-content: center; 
  	flex-direction: column; 
  	border-top: 1px solid var(--orange-8);
  	border-bottom: 1px solid var(--orange-8);
  }  
  .hidden {
  	display: none;
  }
  .num.green {
  	background-color: green;
  	color: white;
  }  
  
</style>

</head>

<body>

<div class="wrapper" style="position: relative">
<header class="header">
  <a href="https://research.cloudflare.com"><img class="logo" src="https://research.cloudflare.com/img/logo.svg" alt="Cloudflare Research logo"></a>
  <a href="/" style="text-decoration: none"><span style="font-size: 1.4rem">Privacy Pass</span></a><!-- &nbsp;<small>"Privacy Pass with Private Access Tokens"</small> -->
  <span class="flare" style="background-color: var(--violet-2); color: white;">DEMO</span>
  <div style="position: absolute; display: block; border: 0; padding: 0; margin: 0; width: 100%; height: 0.2rem; top: 3.6rem; background: linear-gradient(70deg, var(--green-8) 30%, rgba(0,0,0,0) 30%), linear-gradient(30deg, var(--indigo-8) 60%, var(--orange-8) 60%);">&nbsp;</div>
</header>

<div class="description">
  <br>
  <div class="box" id="b1"><span class="num">1</span>Origin returns WWW-Authenticate header</div>
  <div class="current" id="b2"><span class="num">2</span>Attester presents challenge</div>
  <div class="action hidden" id="a2">User successfully completed challenge</div>
  <div class="box" id="b3"><span class="num">3</span>Issuer issues token</div>
  <div class="action hidden" id="a3">Browser extension reloads Origin tab with token</div>
  <div class="error hidden" id="e3">Missing <a href="https://chrome.google.com/webstore/detail/privacy-pass/ajhmfdgkijocedmfjonnpjfojldioehi">browser extension</a></div>
  <div class="snt hidden" id="snt">See origin tab</div>
  <div class="box" id="b4"><span class="num">4</span>New request to Origin made with token</div>
  <br><br>
</div>

<main>
  <br>
  <h2>Interactive challenge
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="2rem">
      <path fill="#000000" d="M99.73 57L25 131.7V487h110V188.3l80-80V57H99.73zM80 103h80v18H80v-18zm138 27.7L154.7 194c6.4 3.2 13.6 5 21.3 5 26.1 0 47-20.9 47-47 0-7.7-1.8-14.9-5-21.3zm22.7 15.3c.2 2 .3 4 .3 6 0 8.5-1.7 16.6-4.6 24H473c5.8 0 8.9-1.8 11.3-4.5 2.3-2.6 3.7-6.5 3.7-10.5s-1.4-7.9-3.7-10.5c-2.4-2.7-5.5-4.5-11.3-4.5H240.7zm-15.2 48c-4 4.8-8.7 8.9-13.9 12.3l216.8 117.9c5 2.7 8.7 2.6 12 1.4 3.4-1.2 6.5-4 8.4-7.5 1.9-3.5 2.5-7.5 1.7-11-.8-3.4-2.7-6.5-7.7-9.3L251.7 194h-26.2zm-35 21.3c-4.2 1-8.5 1.6-12.9 1.7l86.7 211.6c2.2 5.3 5.1 7.5 8.5 8.7 3.3 1.1 7.5.9 11.2-.6 3.7-1.5 6.7-4.2 8.3-7.4 1.5-3.2 2-6.8-.1-12.1l-77.4-188.6-24.3-13.3z"/>
    </svg>

  </h2>

  <div class="cf-turnstile" data-sitekey="${ctx.env.TURNSTILE_PUBLIC_KEY}" data-callback="fetchToken" data-theme="light"></div>
  <br>
  An <a class="q" target="_blank" href="https://www.ietf.org/archive/id/draft-ietf-privacypass-architecture-09.html#name-attester-role">Attester</a> vouches for some attribute(s) of the user. In this instance 
  it is the ability to solve a <a target="_blank" href="https://www.cloudflare.com/products/turnstile/">Turnstile</a> challenge.<br><br>

  Successful solution of the above challenge results in the <a class="q" target="_blank" href="https://www.ietf.org/archive/id/draft-ietf-privacypass-architecture-09.html#name-attester-role">Attester</a> requesting a <a class="q" target="_blank" href="https://blog.cloudflare.com/eliminating-captchas-on-iphones-and-macs-using-new-standard/">Private Access Token</a> from the <a class="q" target="_blank" href="https://www.ietf.org/archive/id/draft-ietf-privacypass-architecture-09.html#name-issuer-role">Issuer</a>. <br><br>

  The <a href="https://chrome.google.com/webstore/detail/privacy-pass/ajhmfdgkijocedmfjonnpjfojldioehi">Privacy Pass extension</a>, on receipt of the <a class="q" target="_blank" href="https://blog.cloudflare.com/eliminating-captchas-on-iphones-and-macs-using-new-standard/">Private Access Token</a>, initiates a reload of the original page from the Origin. The token is sent along with that reload request.

</main>


<footer class="footer" style="z-index: 2; background-color: white">
  <a class="plain" href="https://www.cloudflare.com"> Copyright &copy; <span id="year">2021</span>&nbsp;Cloudflare, Inc.&nbsp;</a>
  <script>document.getElementById( 'year' ).innerHTML = ( new Date().getFullYear() )</script>
  <a href="https://research.cloudflare.com/contact/">Contact us</a>
  <a href="https://www.cloudflare.com/privacypolicy/">Privacy policy</a>
  <a href="https://www.cloudflare.com/website-terms/">Terms of service</a>
</footer>
</div>

</body>

</html>
`;
