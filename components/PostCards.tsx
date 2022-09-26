export interface PostCard {
    title: string
    href: string
    category: {
        name: string
        href: string
    }
    description: string
    date: string
    datetime: string
    imageUrl: string
    author: {
        name: string
        href: string
        imageUrl: string
    }
}

export default function PostCards({posts}: {posts: PostCard[]}) {
    return (
        <div className="mx-auto mt-12 grid max-w-lg gap-5 lg:max-w-none lg:grid-cols-3">
            {posts.map((post) => (
                <div key={post.title} className="flex flex-col overflow-hidden rounded-lg shadow-lg">
                    <div className="flex-shrink-0">
                        <img className="h-48 w-full object-cover" src={post.imageUrl} alt="" />
                    </div>
                    <div className="flex flex-1 flex-col justify-between bg-white p-6">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-indigo-600">
                                <a href={post.category.href} className="hover:underline">
                                    {post.category.name}
                                </a>
                            </p>
                            <a href={post.href} className="mt-2 block">
                                <p className="text-xl font-semibold text-gray-900">{post.title}</p>
                                <p className="mt-3 text-base text-gray-500">{post.description}</p>
                            </a>
                        </div>
                        <div className="mt-6 flex items-center">
                            <div className="flex-shrink-0">
                                <a href={post.author.href}>
                                    <span className="sr-only">{post.author.name}</span>
                                    <img className="h-10 w-10 rounded-full" src={post.author.imageUrl} alt="" />
                                </a>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">
                                    <a href={post.author.href} className="hover:underline">
                                        {post.author.name}
                                    </a>
                                </p>
                                <div className="flex space-x-1 text-sm text-gray-500">
                                    <time dateTime={post.datetime}>{post.date}</time>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}