const server = Deno.listen({ port: 80 });
console.log("File server running on http://localhost:80/index.html");
const __dirname = new URL(".", import.meta.url).pathname;

for await (const conn of server) {
    handleHttp(conn).catch(console.error);
}

async function handleHttp(conn: Deno.Conn) {
    const httpConn = Deno.serveHttp(conn);
    for await (const requestEvent of httpConn) {
        
        const url = new URL(requestEvent.request.url);
        let filepath = decodeURIComponent(url.pathname);
        if(filepath === "/") {
            filepath = "/index.html"
        } else if (filepath.toLocaleLowerCase().indexOf(".") <= 0) {
            filepath = `${filepath}.html`;
        }

        let file;
        try {
            console.log(filepath);
            file = await Deno.open(__dirname + "/public" + filepath, { read: true });
        } catch {
            const notFoundResponse = new Response("404 Not Found", { status: 404 });
            await requestEvent.respondWith(notFoundResponse);
            return;
        }

        const readableStream = file.readable;
        const response = new Response(readableStream);
        await requestEvent.respondWith(response);
    }
}