export const getPostById = async (postId: string) => {
    const response = await fetch('https://gql.hashnode.com', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.HASHNODE_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
            query: `
                query GetPostById {
                    post(id: "${postId}") {
                        id
                        title
                        url
                        content {
                            markdown
                        }
                    }
                }
            `,
        })
    })

    const data = await response.json();
    return data.data.post;
}

