import axios from 'axios';
import FormData from 'form-data';

const API = 'https://ipfs.infura.io:5001/api/v0';
const gateway = 'nance.infura-ipfs.io/ipfs';
const AUTH_HEADER = `Basic ${Buffer.from(
  `${process.env.NEXT_PUBLIC_INFURA_IPFS_ID}:${process.env.NEXT_PUBLIC_INFURA_IPFS_SECRET}`,
).toString('base64')}`;

// https://github.com/jbx-protocol/juice-interface/blob/main/src/lib/infura/ipfs.ts
export async function imageUpload(blobInfo: any) {
  const formData = new FormData();
  formData.append('file', blobInfo.blob());
  return axios({
    method: 'post',
    url: `${API}/add`,
    headers: {
      'Authorization': AUTH_HEADER,
      'Content-Type': 'multipart/form-data',
    },
    data: formData
  }).then((res) => {
    const cid = res.data.Hash;
    return `https://${gateway}/${cid}`
  }).catch((e) => {
    return Promise.reject(e);
  });
}