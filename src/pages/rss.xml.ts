import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context: any) {
  const posts = await getCollection('blog');
  return rss({
    title: 'Samuel J Mathew • Engineering Blog',
    description: 'Deep dives on distributed computing, enterprise Java, reactive frontend architectures, and autonomous AI engineering harnesses.',
    site: context.site || 'https://samuelj90.github.io',
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: new Date(post.data.date),
      description: post.data.description,
      link: `/blog/${post.id}/`,
    })),
    customData: `<language>en-us</language>`,
  });
}
