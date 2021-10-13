<template>
  <a class="blog" v-for="blog in blogs" :href="withBase(blog.regularPath)">
    <h2>{{ blog.frontMatter.title }}</h2>
    <time :datetime="blog.frontMatter.date">
      {{ blog.frontMatter.date.slice(0, 10) }}
    </time>
    <p>{{ blog.frontMatter.description }}</p>
  </a>
</template>

<script setup lang="ts">
import { useData, withBase } from "vitepress";
const blogs = useData().theme.value.blogs;
const router = useRouter();
</script>
<style scoped>
.blog {
  color: #555;
  display: block;
  padding: 2rem 0;
  cursor: pointer;
  text-decoration: none;
}
time {
  color: #aaa;
  font-family: Palatino;
  letter-spacing: 1px;
}
</style>
