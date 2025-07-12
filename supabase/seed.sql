-- Insert sample creators
INSERT INTO public.profiles (id, username, email, full_name, bio, account_type, subscription_price, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'creator1', 'creator1@example.com', 'Creator One', 'Professional photographer sharing exclusive content', 'creator', 9.99, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000002', 'creator2', 'creator2@example.com', 'Creator Two', 'Fitness expert with workout tutorials', 'creator', 14.99, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000003', 'creator3', 'creator3@example.com', 'Creator Three', 'Digital artist sharing creative process', 'creator', 7.99, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample fans
INSERT INTO public.profiles (id, username, email, full_name, account_type, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000004', 'fan1', 'fan1@example.com', 'Fan One', 'fan', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000005', 'fan2', 'fan2@example.com', 'Fan Two', 'fan', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample posts with required file_url
INSERT INTO public.posts (id, title, content, file_url, creator_id, is_preview, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Welcome to my channel!', 'This is my first post. Excited to share content with you all!', '00000000-0000-0000-0000-000000000001/sample-image-1.jpg', '00000000-0000-0000-0000-000000000001', true, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000002', 'Exclusive photo shoot', 'Behind the scenes of my latest photo shoot. Subscribers only!', '00000000-0000-0000-0000-000000000001/sample-image-2.jpg', '00000000-0000-0000-0000-000000000001', false, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000003', 'New workout routine', 'Check out my new HIIT workout routine!', '00000000-0000-0000-0000-000000000002/sample-video-1.mp4', '00000000-0000-0000-0000-000000000002', true, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000004', 'Premium workout tips', 'Advanced techniques for subscribers only', '00000000-0000-0000-0000-000000000002/sample-video-2.mp4', '00000000-0000-0000-0000-000000000002', false, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000005', 'Art showcase', 'My latest digital art creation', '00000000-0000-0000-0000-000000000003/sample-image-3.jpg', '00000000-0000-0000-0000-000000000003', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample subscriptions
INSERT INTO public.subscriptions (id, subscriber_id, creator_id, status, current_period_end, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'active', NOW() + INTERVAL '30 days', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', 'active', NOW() + INTERVAL '30 days', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample apple gifts
INSERT INTO public.apple_gifts (id, sender_id, creator_id, post_id, amount, price_per_apple, currency, total_amount, status, created_at)
VALUES 
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 5, 1.44, 'USD', 7.20, 'completed', NOW() - INTERVAL '2 days'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 10, 1.44, 'USD', 14.40, 'completed', NOW() - INTERVAL '1 day'),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 3, 1.44, 'USD', 4.32, 'completed', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;
