import axios from '@root/utils/axios'

import type { FacebookUser } from '@root/types'

export const getFacebookUser = async (accessToken: string) => {
  const response = await axios.get(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`)

  return response.data as FacebookUser
}
