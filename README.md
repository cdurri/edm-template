
#version 1
This EDM template for create a new project EDM.

How does it work?

1. index - help you list index edm
2. your title email will be your file'name.pug
3. the workflow: 
  block components > layout > Your edm.pug(your_title.pug) > Index 

Step by step

1. You should re-style variables
2. create components 
3. style components 
4. when dev style responsive in file-style-header/_media-responsive.scss (remember copy this content to file this.css when you build)
5. gulp build your file
6. replace file copy_to_file_build.scss to file html
7. done.

How does it help?
1. fixed Gmail App in Ios
2. Fixed center in Outlook
3. Can Use Gulp (pug + Scss) to build EDM
4. maintainance is very easy with variables file.
5. automatic to copy file media-responsive into head's tag style
6. setup render only 1 file css in app/css from scss
7. Set automatic gulp-build to html inline style.

How can you help me?

1. Fix file gulpfile.js to remove any no need syntax (js, compress)
2. continue...





# FE starter with Gulp, PUG, SASS

This is a Pug and Sass starter project using gulp for task automation.

## Local Resources Included:

- Normalize CSS for reset CSS on browsers.
- Skeleton CSS for grid layout (optional).

## Gulp Tasks:

On the gulp side there are utilities listed bellow

- compile sass
- live browser reload
- concat css into one file and minify it
- auto prefix css
- concat js into one file and minify it
- minify images
- cache minified images
- send all above into a dist folder + copy fonts
- clean unused files
- ESLint JavaScript code
- critical CSS

## How to use:

1. Clone to your desktop.
2. Run `npm install`.
3. Run `gulp` to generate the project and be able to make changes as needed.
4. Stop the gulp, and run `gulp build` to build your site.
5. Copy the dist directory to your server and you are set.
6. Deploy critical css:
- HTML in dist folder:
  + Remove line <link rel="stylesheet" type="text/css" href="css/criticalCSS.css"> on head
  + Copy all code inside "dist/css/criticalCSS.css" to <style></style> on head

## JS plugin listing to use:

1. Headroom:
http://wicky.nillia.ms/headroom.js/

2. Inview:
https://camwiegert.github.io/in-view/

3. Slider carousel:
https://github.com/ganlanyuan/tiny-slider

3. Parallax scrolling:
https://github.com/nk-o/jarallax

## CSS / SASS Styleguide

1. Airbnb:
https://github.com/airbnb/css

