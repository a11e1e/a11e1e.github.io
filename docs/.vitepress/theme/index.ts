import Blogs from "./components/Blogs.vue";
import HomePage from "./components/HomePage.vue";
import About from "./components/About.vue";
// import DefaultTheme from "vitepress/dist/client/theme-default";
import DefaultTheme from 'vitepress/theme'

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component("Blogs", Blogs);
    app.component("HomePage", HomePage);
    app.component("About", About);
  },
};
