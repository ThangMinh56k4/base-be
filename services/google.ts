import axios from '@root/utils/axios'
import qs from 'querystring'

import type { GoogleUser } from '@root/types'

type getGoogleAccessTokenParams = {
  code: string
  client_id: string
  client_secret: string
  redirect_uri: string
}

/**
 * Fetches an access token from Google using the provided authorization code.
 * @param {string} code - The authorization code received from Google.
 * @returns {Promise<string>} - A promise that resolves to the access token.
 * @throws Will throw an error if the access token is invalid.
 */
export const getGoogleAccessToken = async ({
  code,
  client_id,
  client_secret,
  redirect_uri
}: getGoogleAccessTokenParams) => {
  const url = 'https://oauth2.googleapis.com/token'
  const values = {
    code,
    client_id,
    client_secret,
    redirect_uri,
    grant_type: 'authorization_code'
  }
  const tokenRes = await axios.post(url, qs.stringify(values), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })

  console.log('tokenRes:', tokenRes.data)

  const { access_token } = tokenRes.data || {}

  if (!access_token) {
    throw new Error('Invalid access token')
  }

  return access_token
}

/**
 * Fetches user information from Google using the provided access token.
 * @param {string} accessToken - The access token obtained from Google OAuth.
 * @returns {Promise<GoogleUser>} - A promise that resolves to the Google user information.
 * @throws Will throw an error if the email is not verified.
 */
export const getGoogleUser = async (accessToken: string) => {
  const userRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })

  const googleUser = userRes.data

  if (!googleUser.email_verified) {
    throw new Error('Email not verified')
  }

  return googleUser as GoogleUser
}
