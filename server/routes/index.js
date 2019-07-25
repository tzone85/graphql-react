// no controllers for now

const routes = [
    {
        method: 'GET',
        url: 'api/books',
        schema: {
            summary: 'Get Books',
            tags:  ['Books'],
        },
        handler: () => { }
    }
]