# Environment Configuration Guide

## Development (local)
File: `.env`
```
REACT_APP_API_URL=https://www.rasogha.com
```

## Production (live server)
File: `.env.production`
```
REACT_APP_API_URL=https://www.rasogha.com

```

## How to go live — 3 steps
1. Open `frontend/.env.production`
2. Set `REACT_APP_API_URL` to your server URL
3. Run `npm run build` and upload the `build/` folder

No other file changes needed.

## Using file URLs in components
Always use `getFileUrl()` for uploaded file paths (photos, PDFs, signatures):

```js
import { getFileUrl } from './api/axiosInstance';

<img src={getFileUrl(application.passportPhotoUrl)} />
<a href={getFileUrl(application.birthCertificateUrl)}>Download</a>
window.open(getFileUrl(application.birthCertificateUrl), '_blank');
```

## Import paths by folder depth
```
pages/       → '../../api/axiosInstance'
components/  → '../../api/axiosInstance'
context/     → '../api/axiosInstance'
services/    → '../api/axiosInstance'
```
