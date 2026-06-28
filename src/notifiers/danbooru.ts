import axios from "axios";
import { Rule34Post } from "../types";
import { getLogger } from "@utils/logger";

const logger = getLogger("danbooru")

const BASE_URL = "https://danbooru.donmai.us/posts.json?limit=50";

export async function fetchPosts(tags?: string): Promise<Rule34Post[]> {
  try {
    const tagParam = tags ? `&tags=${encodeURIComponent(tags.toLowerCase())}` : "";
    const response = await axios.get(`${BASE_URL}${tagParam}`, {
      headers: {
        "User-Agent": "Lyra Discord Bot"
      }
    });

    if (!Array.isArray(response.data)) return [];

    return response.data.map((post: any) => ({
      id: post.id,
      url: post.large_file_url ?? post.file_url,
      tags: post.tag_string,
      score: post.score,
      rating: post.rating,
    })).filter((post: Rule34Post) => !!post.url);
  } catch (err) {
    logger.error(`Failed to fetch Danbooru posts: ${err}`);
    return [];
  }
}