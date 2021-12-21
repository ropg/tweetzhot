# Release Notes

### 1.0.0

- Initial release

### 1.0.1

- More effort convincing twitter we're a browser: works on more puppeteer/chromium combos

### 1.1.0

- Extracts twitter-detected language code from tweet

### 1.1.1

- Detects more twitter error messages to avoid "unknown error"

### 1.1.2

- Scroll window up a bit so header of some reply tweets does not get mangled

### 1.1.3

- Add fallback to span with username in it if no 25px fonts because tweet contains no text only images

### 1.1.4

- Was shooting wrong tweet in thread sometimes. Now keeps looking if found div is outside of article tag, seems to have fixed that.
