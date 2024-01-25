import { type CollectionBalance } from "~/customHooks/useTokenBalances/types";

export const sortAndAddLineBreaksToNftJSX = (
  nftArr: CollectionBalance[],
): JSX.Element => (
  <>
    <div>
      {nftArr
        .filter((item: CollectionBalance) => item.collectionName)
        .map((item: CollectionBalance, index: number) => {
          const tokens = item.tokenIds
            .sort((a, b) => Number(a) - Number(b))
            .map((token: string, tknIndex: number) => (
              <span key={token} className="text-orange-400">
                #{token}
                {tknIndex !== item.tokenIds.length - 1 ? `,${" "}` : ""}
              </span>
            ));

          const groupsOfTenTokens = Array.from(
            { length: Math.ceil(tokens.length / 10) },
            (_, i) => tokens.slice(i * 10, (i + 1) * 10),
          );

          const tokensWithLineBreaks = groupsOfTenTokens.map(
            (group, groupIndex) => (
              <span key={groupIndex}>
                {group}
                {groupIndex < groupsOfTenTokens.length - 1 && <br />}
              </span>
            ),
          );
          return (
            <div key={index} className="flex-rows flex w-full text-start">
              <span className="pr-3" />
              <span className="text-md max-w-[170px] text-dashboard-codeLightBlue">
                Collection &quot;{item.collectionName}&quot;:{" "}
                {tokensWithLineBreaks}
              </span>
            </div>
          );
        })}
    </div>
  </>
);
