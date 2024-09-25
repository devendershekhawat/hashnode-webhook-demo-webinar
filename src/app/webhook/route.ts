import { NextResponse } from 'next/server';
import { validateSignature } from "./util";
import { getPostById } from './graphql';
import { generateTLDR } from './openai';
import { tweetThread } from './X';

export async function POST(req: Request) {
    const signature = req.headers.get('x-hashnode-signature');
    const webhookSecret = process.env.HASHNODE_WEBHOOK_SECRET;

    if (!validateSignature({ incomingSignatureHeader: signature as string, secret: webhookSecret as string })) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const payload = await req.json();
        const { eventType, post } = payload.data;

        if (eventType !== 'post_published' || !post) {
            console.error('Invalid event type or missing post in payload:', payload);
            return NextResponse.json({ message: 'Bad Request' }, { status: 400 });
        }

        const result = await getPostById(post.id);
        if (!result || !result.content || !result.content.markdown) {
            console.error('Invalid post data:', result);
            return NextResponse.json({ message: 'Bad Request' }, { status: 400 });
        }

        const { text: tldr, error } = await generateTLDR(result.content.markdown);
        if (error || !tldr) {
            console.error('Error generating TLDR:', error);
            return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
        }
        const { success } = await tweetThread(tldr, result.url);
        
        if (!success) {
            console.error('Error tweeting thread:', success);
            return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Success' }, { status: 200 });
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

