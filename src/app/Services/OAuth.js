import { AccountApi } from '../Api/AccountApi';
const axios = require('axios');

export class OAuth {
  constructor () {
    this.api = new AccountApi();
  }

  /**
   * Sign in
   *
   * @param {User} user
   *
   * @return {Observable}
   */
  providerSignIn (provider, vars) {
    provider = this.getProviderByName(provider);

    window.location.href = provider.getAuthorizeUrl();
  }

  removeToken() {
    localStorage.removeItem('access_token');
  }

  setToken (token) {
    localStorage.setItem('access_token', token);
    this.setHeader()
  }

  getToken () {
    return localStorage.getItem('access_token');
  }

  providerSignInCode (provider_name, params) {
    var provider = this.getProviderByName(provider_name);
    var params = provider.getParamsAccessToken(params);

    return !params.access_token
      ? this.api.oauthProviderRequestToken(provider_name, params).then(response => {
        this.setToken(response.body.access_token);
      })
      : this.api.oauthProviderExchangeToken(provider_name, params).then(response => {
        this.setToken(response.body.access_token);
      });
  }

  signIn (params) {
    return this.api.signIn(params).then(response => {
      this.setToken(response.body.data.access_token);
    });
  }

  signUp (params) {
    return this.api.signUp(params);
  }

  authenticate (vars) {
    var access_token = this.getToken();

    return this.api.getUser(access_token).then(response => {
      return response;
    })
  }

  setHeader()
  {
    axios.defaults.headers.common["Authorization"] = 'Bearer ' + this.getToken()
  }

  getProviderByName (provider) {
    var providers = {
      github: new OAuthGithubProvider(),
      gitlab: new OAuthGitlabProvider(),
      google: new OAuthGoogleProvider(),
      facebook: new OAuthFacebookProvider()
    };

    return typeof providers[provider] !== 'undefined' ? providers[provider] : null;
  }

  getUser (vars) {
    var access_token = this.getToken();

    return this.api.getUser(access_token);
  }

  confirmEmail (params) {
    return this.api.confirmEmail(params).then(response => {
      this.setToken(response.body.access_token);
    });
  }

  requestConfirmEmail (params) {
    return this.api.requestConfirmEmail(params);
  }

  logout () {
    this.removeToken();
  }
}
