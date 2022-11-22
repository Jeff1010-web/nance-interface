export interface SpaceMetric {
    categories?: string[],
    followers?: number
    proposals?: number,
    name: string,
    network: string,
    networks: string[]
}

export interface AllSpacesResponse {
    [spaceId: string]: SpaceMetric
}

export async function fetchAllSpaces(): Promise<AllSpacesResponse> {
    return fetch('https://hub.snapshot.org/api/explore', {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(res => res.json()).then(json => json.spaces)
  }