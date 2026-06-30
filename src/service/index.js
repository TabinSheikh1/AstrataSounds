import { SERVER_URL } from '../config/api';

export async function generateSong(payload) {
  const res = await fetch(`${SERVER_URL}/song/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(err)
  }

  return res.json()
}
