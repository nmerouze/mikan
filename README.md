# Mikan CMS

Flat-file API-first CMS. Manage your content in one place, deliver on any screen.

# Installation

```
npm install -g mikan
mikan setup /new/path
mikan start -p 3333 /new/path
curl http://localhost:3333/a/links
```

# Projects folder

Mikan CMS is multi-projects meaning you can create multiple different APIs with the same running instance. The setup command will create a projects folder with a test project inside. Each project has the following folders:

- **content**: This folder will contain data for your API. Mikan currently handles CSV files and Markdown files (with frontmatters like Jekyll). It will transform this content into JSON API endpoints.
- **users**: You can manage your users in this folder with Markdown files. Right now there's a login endpoint but it isn't very useful. Mikan will include an admin UI soon.
- **static**: You can put any static files in this folder and Mikan will serve them as static files.
