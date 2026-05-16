import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
  console.log('🚀 Starting Seeding Process...');

  // 1. Ensure Streams exist
  const streams = [
    { name: 'ai-ml', slug: 'ai-ml', description: 'Artificial Intelligence and Machine Learning', icon: 'Activity' },
    { name: 'cloud', slug: 'cloud', description: 'Cloud Infrastructure and Computing', icon: 'Cloud' },
    { name: 'finance', slug: 'finance', description: 'Fintech, Web3, and Banking', icon: 'DollarSign' },
    { name: 'saas', slug: 'saas', description: 'Software as a Service businesses', icon: 'Briefcase' },
    { name: 'dev-tools', slug: 'dev-tools', description: 'Tools for developers', icon: 'Wrench' },
    { name: 'fundraising', slug: 'fundraising', description: 'VCs and Raising Money', icon: 'Users' },
  ];

  for (const s of streams) {
    const { error } = await supabase.from('streams').upsert(s, { onConflict: 'slug' });
    if (error) console.error(`Error upserting stream ${s.slug}:`, error.message);
  }

  // Get stream IDs
  const { data: streamData } = await supabase.from('streams').select('id, slug');
  const streamMap = streamData.reduce((acc, s) => ({ ...acc, [s.slug]: s.id }), {});

  // 2. Create Mock Profiles with Indian Names
  const mockProfiles = [
    { id: '00000000-0000-0000-0000-000000000001', full_name: 'Aryan Sharma', username: 'aryan_builds', bio: 'Building the future of Cloud from Bangalore.', location: 'Bangalore' },
    { id: '00000000-0000-0000-0000-000000000002', full_name: 'Ishani Iyer', username: 'ishani_ai', bio: 'AI Researcher exploring Large Action Models.', location: 'Chennai' },
    { id: '00000000-0000-0000-0000-000000000003', full_name: 'Rohan Malhotra', username: 'rohan_fintech', bio: 'Fintech enthusiast building for Bharat.', location: 'Mumbai' },
    { id: '00000000-0000-0000-0000-000000000004', full_name: 'Priya Das', username: 'priya_codes', bio: 'SaaS founder & indie hacker.', location: 'Hyderabad' },
    { id: '00000000-0000-0000-0000-000000000005', full_name: 'Vikram Singh', username: 'vikram_v', bio: 'Venture Capitalist focusing on DeepTech.', location: 'Delhi' },
    { id: '00000000-0000-0000-0000-000000000006', full_name: 'Ananya K.', username: 'ananya_design', bio: 'Product Designer | Building clean UIs.', location: 'Pune' },
    { id: '00000000-0000-0000-0000-000000000007', full_name: 'Karthik Raja', username: 'karthik_oss', bio: 'Open Source maintainer & DevTools builder.', location: 'Chennai' },
    { id: '00000000-0000-0000-0000-000000000008', full_name: 'Siddharth M.', username: 'sid_hiring', bio: 'Helping founders build elite teams.', location: 'Gurgaon' },
  ];

  for (const p of mockProfiles) {
    const { error } = await supabase.from('profiles').upsert(p, { onConflict: 'id' });
    if (error) console.error(`Error upserting profile ${p.username}:`, error.message);
  }

  // 3. Create Mock Posts for ALL STREAMS
  const mockPosts = [
    {
      author_id: '00000000-0000-0000-0000-000000000001',
      stream_id: streamMap['cloud'],
      content: 'Just migrated our entire architecture to a multi-cloud setup. The latency improvements in EU-West are insane! 🚀 #cloud #infrastructure #bangalore',
      media_urls: ['https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000']
    },
    {
      author_id: '00000000-0000-0000-0000-000000000002',
      stream_id: streamMap['ai-ml'],
      content: 'Excited to share our latest research on Large Action Models. We are finally seeing agents that can actually *do* things beyond just chatting. #ai #ml',
      media_urls: ['https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1000']
    },
    {
      author_id: '00000000-0000-0000-0000-000000000003',
      stream_id: streamMap['finance'],
      content: 'Traditional banking is slow. We just launched an API that settles international payments in under 2 seconds. The future of finance in India is here. #fintech #finance',
      media_urls: ['https://images.unsplash.com/photo-1611974714024-4627d6d5a176?auto=format&fit=crop&q=80&w=1000']
    },
    {
      author_id: '00000000-0000-0000-0000-000000000004',
      stream_id: streamMap['saas'],
      content: 'Hit $10k MRR today! 🥂 It took 14 months of grinding from a small cafe in Hyderabad. Don\'t give up, founders! #saas #growth',
      media_urls: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1000']
    },
    {
      author_id: '00000000-0000-0000-0000-000000000005',
      stream_id: streamMap['fundraising'],
      content: 'Just closed a $5M seed round for a DeepTech startup in Delhi. The Indian ecosystem is maturing rapidly. #vc #deeptech #fundraising',
      media_urls: ['https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=1000']
    },
    {
      author_id: '00000000-0000-0000-0000-000000000006',
      stream_id: streamMap['design'],
      content: 'Clean lines, dark mode, and glassmorphism. Working on a new design system for Founders Cult. What do you think? #design #uiux',
      media_urls: ['https://images.unsplash.com/photo-1586717791821-3f44a563de4c?auto=format&fit=crop&q=80&w=1000']
    },
    {
      author_id: '00000000-0000-0000-0000-000000000007',
      stream_id: streamMap['dev-tools'],
      content: 'Testing a new CLI tool that automates Supabase deployments. DevTools shouldn\'t be hard to use. #devtools #cli #supabase',
      media_urls: ['https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1000']
    },
    {
      author_id: '00000000-0000-0000-0000-000000000008',
      stream_id: streamMap['hiring'],
      content: 'Looking for a Senior React Engineer for a fast-growing Fintech in Gurgaon. DM for details! #hiring #jobs #tech',
    },
    {
      author_id: '00000000-0000-0000-0000-000000000004',
      stream_id: streamMap['side-projects'],
      content: 'Built a small chrome extension over the weekend to track my deep work sessions. Indie hacking is so therapeutic. #indie #buildinpublic',
    },
    {
      author_id: '00000000-0000-0000-0000-000000000007',
      stream_id: streamMap['open-source'],
      content: 'Just reached 1k stars on my latest open source project! ⭐️ Grateful for the community support. #opensource #github',
    },
    {
      author_id: '00000000-0000-0000-0000-000000000001',
      stream_id: streamMap['ship-it'],
      content: 'Finally shipping the Alpha version of Founders Cult today! It\'s been a wild ride. 🚀 #shipit #launch',
    }
  ];

  for (const post of mockPosts) {
    const { error } = await supabase.from('posts').insert(post);
    if (error) console.error(`Error inserting post:`, error.message);
  }

  console.log('✅ Seeding Completed!');
}

seed().catch(err => {
  console.error('Fatal seeding error:', err);
  process.exit(1);
});
