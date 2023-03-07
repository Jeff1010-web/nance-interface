import axios from 'axios';

const API = 'https://api.nft.storage';
const gateway = 'ipfs.nftstorage.link';
const key = process.env.NEXT_PUBLIC_STORAGE_KEY

export async function imageUpload(blobInfo: any) {
  const data = Buffer.from(blobInfo.base64(), 'base64');
  return axios({
    method: 'post',
    url: `${API}/upload`,
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': '*/*',
    },
    data
  }).then((res) => {
    const cid = res.data.value.cid;
    return `https://${cid}.${gateway}`
  }).catch((e) => {
    return Promise.reject(e);
  });
}