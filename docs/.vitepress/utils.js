const matter = require("gray-matter");
const fs = require("fs-extra");
const path = require("path");

async function getAllBlogs() {
  const { globby } = await import("globby");

  let paths = await globby(["**.md"], {
    ignore: ["node_modules", "**/index.md"],
  });
  let blogs = await Promise.all(
    paths.map(async (item) => {
      const content = await fs.readFile(item, "utf-8");
      const { data } = matter(content);
      return {
        frontMatter: data,
        regularPath: item.replace(".md", ".html").replace("docs", ""),
      };
    })
  );
  return blogs.sort((a, b) => a.frontMatter.date - b.frontMatter.date);
}

module.exports = { getAllBlogs };
