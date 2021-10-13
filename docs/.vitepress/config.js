const { getAllBlogs } = require("./utils.js");
module.exports = (async () => {
  return {
    title: "刘理铖",
    description: "随便玩玩",
    lang: "zh",
    base: "/",
    test: "test",
    themeConfig: {
      blogs: await getAllBlogs(),
      nav: [
        { text: "首页", link: "/" },
        { text: "博客", link: "/blogs/" },
        { text: "关于", link: "/about/" },
      ],
    },
  };
})();
