import { ACTIONS_CORS_HEADERS, ActionGetResponse, ActionPostRequest, ActionPostResponse, MEMO_PROGRAM_ID, createPostResponse, parseURL } from "@solana/actions"
import { ComputeBudgetProgram, Connection, PublicKey, Transaction, TransactionInstruction, clusterApiUrl } from "@solana/web3.js"
import { getDomainKeysWithReverses } from "@bonfida/spl-name-service"
export const GET = (req: Request) => {
    const payload: ActionGetResponse = {
        icon: new URL("/modi.jpeg", new URL(req.url).origin).toString(),
        label: "Click for Surprise",
        description: "Surprise",
        title: "Experimenting"
    }

    return Response.json(payload, {
        headers: ACTIONS_CORS_HEADERS
    })
}

export const OPTIONS = GET;

export const POST = async (req: Request) => {
    try{
        const body: ActionPostRequest = await req.json();

        let account: PublicKey;

        try{
            account = new PublicKey(body.account);
        } catch (err) {
            return new Response('invalid account provided', {
                status: 400,
                headers: ACTIONS_CORS_HEADERS
            })
        }

        console.log(`Key verification succeeded ${account}`);

        const transaction = new Transaction();

        transaction.add(
            ComputeBudgetProgram.setComputeUnitPrice({
                microLamports: 1000
            }),
            new TransactionInstruction({
                programId: new PublicKey(MEMO_PROGRAM_ID),
                data: Buffer.from("Experimenting", "utf8"),
                keys: [],
            })
        )

        transaction.feePayer = account;
        let name;
        const connection = new Connection(clusterApiUrl("mainnet-beta"));
        try {
            name = (await getDomainKeysWithReverses(connection, account))[0].domain;
        }
        catch(err){
            name = "get an SNS domain"
        }

        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

        const payload: ActionPostResponse = await createPostResponse({
            fields: {
                transaction,
                message: `gm ${name}`
            }
        })

        return Response.json(payload, { headers: ACTIONS_CORS_HEADERS})
    } catch(err){
        return Response.json("unkown error", { status: 400})
    }
}