# Quill DM exporter

Quick and nasty script to get a set of DMs out of Quill on short notice. Assumes a base level of knowledge and that you have NodeJS installed already.

## Getting started

1. Download and install a HTTP proxy, [following this guide](https://stackoverflow.com/a/58776988).
2. If using Proxyman, install `Proxyman Proxy Helper Tool` to allow sniffing of HTTPS requests (see Preference > Advanced)
3. Open Quill and open the DM you'd like to back uup
4. Look for request to `https://api.quill.chat/thread/history`, right click, copy as cURL. Paste this into a text editor.
5. Extract the `&dm=...` and `&before=...` properties (if `before` exists)

- The DM property is the ID of the set of DMs you would like to back up. If you have multiple DMs to back up, you'll need to collect this property for each one.
- Before appears to be the method of pagination. I haven't tried backing up without it.

6. Extract the `Authorization` and `X-Quill-Session` headers from the cURL command.
7. Clone this repo, and modify lines 8-11 of `index.js` with the extracted properties:

```javascript
const DM_ID = "CHANGE-ME";
const BEFORE_VALUE = decodeURIComponent("CHANGE-ME");
const AUTH_HEADER = "CHANGE-ME";
const QUILL_SESSION = "CHANGE-ME";
```

8. In your terminal navigate to where to cloned the repo.
9. Run `npm i`
10. Run `npm start`.
11. The script will populate a .txt file with your DMs in the following format, and a `files` directory with any files you've sent.

```
[user-id]: [comment]
```
