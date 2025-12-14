import { useEffect, useState } from "react";
import RightArrow from "@/components/icons/RightArrow";
import { checkDb_user } from "@/lib/fetching/getChatName";
import { User } from "@/lib/database/dbuserInfo";
import EditIcon from "@/components/icons/EditIcon";

export default function SystemMessage({ message, serverIp }: any) {
    const [processedContent, setProcessedContent] = useState<string>("");

    useEffect(() => {
        const processMessageContent = async () => {
            const regex = /<@([^>]*)>/g;
            let updatedContent = message.content;

            const mentions = updatedContent.match(regex);

            if (!mentions) {
                setProcessedContent(updatedContent);
                return;
            }

            const promises = mentions.map(async (mention: string) => {
                const userId = mention.substring(2, mention.length - 1);
                // @ts-ignore
                const userinfo: User = await checkDb_user(userId, serverIp, false);
                updatedContent = updatedContent.replace(mention, userinfo.username);
            });

            await Promise.all(promises);
            setProcessedContent(updatedContent);
        };

        processMessageContent();
    }, [message.content, serverIp]);

    return (
        <>
            {processedContent && (
                <div style={{ display: "flex", gap: "10px", margin: "5px 0px" }} data-messageid={message._id}>
                    {message.type == "join" && <RightArrow color={"#33d933"} />}
                    {message.type == "leave" && <RightArrow color={"var(--red)"} inverted={true} />}
                    {message.type == "edit" && <EditIcon color={"var(--textColor)"} />}
                    <p>{processedContent}</p>
                </div>
            )}
        </>
    );
}
