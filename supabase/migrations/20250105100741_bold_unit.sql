/*
  # Initial Schema for EV Chat Application

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, matches auth.users)
      - `plate_number` (text, unique)
      - `vehicle_model` (text)
      - `created_at` (timestamp)
    
    - `chat_messages`
      - `id` (uuid, primary key)
      - `sender_id` (uuid, references profiles)
      - `receiver_id` (uuid, references profiles)
      - `message` (text)
      - `created_at` (timestamp)
      - `read` (boolean)
    
    - `accessories`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `image_url` (text)
      - `category` (text)
      - `created_at` (timestamp)
    
    - `accessory_ratings`
      - `id` (uuid, primary key)
      - `accessory_id` (uuid, references accessories)
      - `user_id` (uuid, references profiles)
      - `rating` (integer)
      - `review` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  plate_number text UNIQUE NOT NULL,
  vehicle_model text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Chat messages table
CREATE TABLE chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES profiles(id) NOT NULL,
  receiver_id uuid REFERENCES profiles(id) NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now(),
  read boolean DEFAULT false
);

-- Accessories table
CREATE TABLE accessories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  category text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Accessory ratings table
CREATE TABLE accessory_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  accessory_id uuid REFERENCES accessories(id) NOT NULL,
  user_id uuid REFERENCES profiles(id) NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  review text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(accessory_id, user_id)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE accessories ENABLE ROW LEVEL SECURITY;
ALTER TABLE accessory_ratings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Chat messages policies
CREATE POLICY "Users can view their own messages"
  ON chat_messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can insert their own messages"
  ON chat_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Accessories policies
CREATE POLICY "Accessories are viewable by everyone"
  ON accessories FOR SELECT
  USING (true);

-- Accessory ratings policies
CREATE POLICY "Ratings are viewable by everyone"
  ON accessory_ratings FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own ratings"
  ON accessory_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
  ON accessory_ratings FOR UPDATE
  USING (auth.uid() = user_id);