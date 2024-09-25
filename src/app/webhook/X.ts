import { TwitterApi } from 'twitter-api-v2';

const client = new TwitterApi({
    appKey: process.env.X_API_KEY!,
    appSecret: process.env.X_API_KEY_SECRET!,
    accessToken: process.env.X_ACCESS_TOKEN!,
    accessSecret: process.env.X_ACCESS_TOKEN_SECRET!,
});

export const tweetThread = async (content: string, postUrl: string) => {
    try {
        const tweets = [
            content,
            `Here is the link to the post: ${postUrl}`
        ];
        const response = await client.v2.tweetThread(tweets);
        return { success: true, data: response };
    } catch (error) {
        console.error('Failed to tweet thread:', error);
        return { success: false, error: 'Failed to tweet thread. Please check the logs for more details.' };
    }
}


