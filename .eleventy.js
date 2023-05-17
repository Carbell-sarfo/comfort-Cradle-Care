const eleventySass = require("@11tyrocks/eleventy-plugin-sass-lightningcss");
const browserslist = require("browserslist");
const {
  bundle,
  browserslistToTargets,
  composeVisitors,
} = require("lightningcss");

// Set default transpiling targets
let browserslistTargets = "> 0.2% and not dead";

// Check for user's browserslist
try {
  const package = path.resolve(__dirname, fs.realpathSync("package.json"));
  const userPkgBrowserslist = require(package);

  if (userPkgBrowserslist.browserslist) {
    browserslistTargets = userPkgBrowserslist.browserslist;
  } else {
    try {
      const browserslistrc = path.resolve(
        __dirname,
        fs.realpathSync(".browserslistrc")
      );

      fs.readFile(browserslistrc, "utf8", (_err, data) => {
        if (data.length) {
          browserslistTargets = [];
        }

        data.split(/\r?\n/).forEach((line) => {
          if (line.length && !line.startsWith("#")) {
            browserslistTargets.push(line);
          }
        });
      });
    } catch (err) {
      // no .browserslistrc
    }
  }
} catch (err) {
  // no package browserslist
}



module.exports = function (eleventyConfig) {

  const defaults = {
    importPrefix: "_",
    nesting: true,
    customMedia: true,
    minify: true,
    sourceMap: false,
    visitors: [],
    customAtRules: {},
  };

  
  const {
    importPrefix,
    nesting,
    customMedia,
    minify,
    sourceMap,
    visitors,
    customAtRules,
  } = {
    ...defaults,
    ...options,
  };

  // Recognize CSS as a "template language"
  eleventyConfig.addTemplateFormats("css");

  
  // Process CSS with LightningCSS
  eleventyConfig.addExtension("css", {
    outputFileExtension: "css",
    compile: async function (_inputContent, inputPath) {
      let parsed = path.parse(inputPath);
      if (parsed.name.startsWith(importPrefix)) {
        return;
      }

      let targets = browserslistToTargets(browserslist(browserslistTargets));

      return async () => {
        let { code } = await bundle({
          filename: inputPath,
          minify,
          sourceMap,
          targets,
          drafts: {
            nesting,
            customMedia,
          },
          customAtRules,
          visitor: composeVisitors(visitors),
        });
        return code;
      };
    },
  });





  eleventyConfig.addPlugin(eleventySass);

  eleventyConfig.addPassthroughCopy("./src/assets");
  eleventyConfig.addPassthroughCopy("./src/js");

  return {
    dir: {
      input: "src",
      output: "public",
    },
  };
};






// const fs = require("node:fs");
// const path = require("node:path");
// const sass = require("sass");
// const browserslist = require("browserslist");
// const { transform, browserslistToTargets } = require("lightningcss");

// // Set default transpiling targets
// let browserslistTargets = "> 0.2% and not dead";

// // Check for user's browserslist
// try {
//   const package = path.resolve(__dirname, fs.realpathSync("package.json"));
//   const userPkgBrowserslist = require(package);

//   if (userPkgBrowserslist.browserslist) {
//     browserslistTargets = userPkgBrowserslist.browserslist;
//   } else {
//     try {
//       const browserslistrc = path.resolve(
//         __dirname,
//         fs.realpathSync(".browserslistrc")
//       );

//       fs.readFile(browserslistrc, "utf8", (_err, data) => {
//         if (data.length) {
//           browserslistTargets = [];
//         }

//         data.split(/\r?\n/).forEach((line) => {
//           if (line.length && !line.startsWith("#")) {
//             browserslistTargets.push(line);
//           }
//         });
//       });
//     } catch (err) {
//       // no .browserslistrc
//     }
//   }
// } catch (err) {
//   // no package browserslist
// }

// module.exports = (eleventyConfig) => {
//   // Recognize Sass as a "template languages"
//   eleventyConfig.addTemplateFormats("scss");

//   // Compile Sass and process with LightningCSS
//   eleventyConfig.addExtension("scss", {
//     outputFileExtension: "css",
//     compile: async function (inputContent, inputPath) {
//       let parsed = path.parse(inputPath);
//       if (parsed.name.startsWith("_")) {
//         return;
//       }

//       let targets = browserslistToTargets(browserslist(browserslistTargets));

//       let result = sass.compileString(inputContent, {
//         loadPaths: [parsed.dir || "."],
//         sourceMap: false,
//       });

//       this.addDependencies(inputPath, result.loadedUrls);

//       return async () => {
//         let { code } = await transform({
//           code: Buffer.from(result.css),
//           minify: true,
//           sourceMap: false,
//           targets,
//         });
//         return code;
//       };
//     },
//   });
// };
