from fastapi import Depends, APIRouter, HTTPException, status
from app.reports.engine import get_reports_engine
import logging
import re
import asyncio

from typing import List

from pydantic import BaseModel

router = APIRouter()
logger = logging.getLogger(__name__)

# TODO: this code really needs to be tested


def separate_numbers(match):
    numbers = match.group(1)
    return "".join([f"[{num.strip()}]" for num in numbers.split(",")])


class Citation(BaseModel):
    source_id: int
    node_id: str


class PromptConfig(BaseModel):
    prompt_type: str
    offset: int
    citations: List[Citation]
    cik: str = "0001018724"


# I used orig_num to distinguish between the citation numbers that were already previously referenced in the main report before and those that were not. The name is random so don't read too much into it, future person who reads this code.

# TODO: learn python destructuring and refactor all the citations processing code into a separate function in a different folder


@router.post("/")
async def get_building_block(promptConfig: PromptConfig):
    """
    Get the competitive advantage of the company
    """
    offset = promptConfig.offset
    citations = promptConfig.citations
    citations_nums = [citation.source_id for citation in citations]
    citations_ids = [citation.node_id for citation in citations]
    # res = await get_reports_engine(promptConfig.cik)
    res = {
        "text": "Amazon.com, Inc., founded in 1994, is a multinational technology company primarily operating in the e-commerce, cloud computing, and digital entertainment industries. The company's key products and services include online stores, third-party seller services, Amazon Web Services (AWS), advertising services, and subscription services, with revenue breakdown of 40% from online stores, 24% from third-party seller services, 16% from AWS, 8% from advertising services, and 7% from subscription services, as of 2023 [2]. Amazon serves customers worldwide, with significant portions of its net sales attributed to the United States (69%), Germany (7%), the United Kingdom (6%), and Japan (5%) [2]. In 2023, Amazon reported total net sales of $574.8 billion, a 12% increase from the previous year [1][2].",
        "nodes": [
            {
                "node_id": "fb0a6d20-60d1-4486-9aa5-6543f2bb9cd1",
                "doc_id": "1f9bc0e7-946d-4e94-b1f2-e8ebcc9098e4",
                "text": "Table\tof\tContents\nResults\tof\tOperations\nWe\thave\torganized\tour\toperations\tinto\tthree\tsegments:\tNorth\tAmerica,\tInternational,\tand\tAWS.\tThese\tsegments\treflect\tthe\tway\tthe\tCompany\tevaluates\tits\nbusiness\tperformance\tand\tmanages\tits\toperations.\tSee\tItem\t8\tof\tPart\tII,\t“Financial\tStatements\tand\tSupplementary\tData\t—\tNote\t10\t—\tSegment\tInformation.”\nOverview\nMacroeconomic\tfactors,\tincluding\tinflation,\tincreased\tinterest\trates,\tsignificant\tcapital\tmarket\tand\tsupply\tchain\tvolatility,\tand\tglobal\teconomic\tand\tgeopolitical\ndevelopments,\thave\tdirect\tand\tindirect\timpacts\ton\tour\tresults\tof\toperations\tthat\tare\tdifficult\tto\tisolate\tand\tquantify.\tIn\taddition,\tchanges\tin\tfuel,\tutility,\tand\tfood\tcosts,\ninterest\trates,\tand\teconomic\toutlook\tmay\timpact\tcustomer\tdemand\tand\tour\tability\tto\tforecast\tconsumer\tspending\tpatterns.\tWe\talso\texpect\tthe\tcurrent\tmacroeconomic\nenvironment\tand\tenterprise\tcustomer\tcost\toptimization\tefforts\tto\timpact\tour\tAWS\trevenue\tgrowth\trates.\tWe\texpect\tsome\tor\tall\tof\tthese\tfactors\tto\tcontinue\tto\timpact\tour\noperations\tinto\tQ1\t2024.\nNet\tSales\nNet\tsales\tinclude\tproduct\tand\tservice\tsales.\tProduct\tsales\trepresent\trevenue\tfrom\tthe\tsale\tof\tproducts\tand\trelated\tshipping\tfees\tand\tdigital\tmedia\tcontent\twhere\twe\nrecord\trevenue\tgross.\tService\tsales\tprimarily\trepresent\tthird-party\tseller\tfees,\twhich\tincludes\tcommissions\tand\tany\trelated\tfulfillment\tand\tshipping\tfees,\tAWS\tsales,\nadvertising\tservices,\tAmazon\tPrime\tmembership\tfees,\tand\tcertain\tdigital\tmedia\tcontent\tsubscriptions.\tNet\tsales\tinformation\tis\tas\tfollows\t(in\tmillions):\n\t\n\t\nYear\tEnded\tDecember\t31,\n\t\n2022\n2023\nNet\tSales:\nNorth\tAmerica\n$\n315,880\t\n$\n352,828\t\nInternational\n118,007\t\n131,200\t\nAWS\n80,096\t\n90,757\t\nConsolidated\n$\n513,983\t\n$\n574,785\t\nYear-over-year\tPercentage\tGrowth\t(Decline):\nNorth\tAmerica\n13\t\n%\n12\t\n%\nInternational\n(8)\n11\t\nAWS\n29\t\n13\t\nConsolidated\n9\t\n12\t\nYear-over-year\tPercentage\tGrowth,\texcluding\tthe\teffect\tof\tforeign\texchange\trates:\nNorth\tAmerica\n13\t\n%\n12\t\n%\nInternational\n4\t\n11\t\nAWS\n29\t\n13\t\nConsolidated\n13\t\n12\t\nNet\tSales\tMix:\nNorth\tAmerica\n61\t\n%\n61\t\n%\nInternational\n23\t\n23\t\nAWS\n16\t\n16\t\nConsolidated\n100\t\n%\n100\t\n%\nSales\tincreased\t12%\tin\t2023,\tcompared\tto\tthe\tprior\tyear.\tChanges\tin\tforeign\texchange\trates\treduced\tnet\tsales\tby\t$71\tmillion\tin\t2023.\tFor\ta\tdiscussion\tof\tthe\neffect\tof\tforeign\texchange\trates\ton\tsales\tgrowth,\tsee\t“Effect\tof\tForeign\tExchange\tRates”\tbelow.\nNorth\tAmerica\tsales\tincreased\t12%\tin\t2023,\tcompared\tto\tthe\tprior\tyear.\tThe\tsales\tgrowth\tprimarily\treflects\tincreased\tunit\tsales,\tprimarily\tby\tthird-party\tsellers,\nadvertising\tsales,\tand\tsubscription\tservices.\tIncreased\tunit\tsales\twere\tdriven\tlargely\tby\tour\tcontinued\tfocus\ton\tprice,\tselection,\tand\tconvenience\tfor\tour\tcustomers,\nincluding\tfrom\tour\tshipping\toffers.\nInternational\tsales\tincreased\t11%\tin\t2023,\tcompared\tto\tthe\tprior\tyear.\tThe\tsales\tgrowth\tprimarily\treflects\tincreased\tunit\tsales,\tprimarily\tby\tthird-party\tsellers,\nadvertising\tsales,\tand\tsubscription\tservices.",
                "source_num": 1,
                "page": "24",
            },
            {
                "node_id": "3ccb9335-50ce-4121-bcde-1d3eab8c9004",
                "doc_id": "1f9bc0e7-946d-4e94-b1f2-e8ebcc9098e4",
                "text": "Table\tof\tContents\nNet\tsales\tby\tgroups\tof\tsimilar\tproducts\tand\tservices,\twhich\talso\thave\tsimilar\teconomic\tcharacteristics,\tis\tas\tfollows\t(in\tmillions):\n\t\n\t\nYear\tEnded\tDecember\t31,\n\t\n2021\n2022\n2023\nNet\tSales:\nOnline\tstores\t(1)\n$\n222,075\n\t\n$\n220,004\n\t\n$\n231,872\n\t\nPhysical\tstores\t(2)\n17,075\n\t\n18,963\n\t\n20,030\n\t\nThird-party\tseller\tservices\t(3)\n103,366\n\t\n117,716\n\t\n140,053\n\t\nAdvertising\tservices\t(4)\n31,160\n\t\n37,739\n\t\n46,906\n\t\nSubscription\tservices\t(5)\n31,768\n\t\n35,218\n\t\n40,209\n\t\nAWS\n62,202\n\t\n80,096\n\t\n90,757\n\t\nOther\t(6)\n2,176\n\t\n4,247\n\t\n4,958\n\t\nConsolidated\n$\n469,822\n\t\n$\n513,983\n\t\n$\n574,785\n\t\n___________________\n(1)\nIncludes\tproduct\tsales\tand\tdigital\tmedia\tcontent\twhere\twe\trecord\trevenue\tgross.\tWe\tleverage\tour\tretail\tinfrastructure\tto\toffer\ta\twide\tselection\tof\tconsumable\tand\ndurable\tgoods\tthat\tincludes\tmedia\tproducts\tavailable\tin\tboth\ta\tphysical\tand\tdigital\tformat,\tsuch\tas\tbooks,\tvideos,\tgames,\tmusic,\tand\tsoftware.\tThese\tproduct\tsales\ninclude\tdigital\tproducts\tsold\ton\ta\ttransactional\tbasis.\tDigital\tmedia\tcontent\tsubscriptions\tthat\tprovide\tunlimited\tviewing\tor\tusage\trights\tare\tincluded\tin\n“Subscription\tservices.”\n(2)\nIncludes\tproduct\tsales\twhere\tour\tcustomers\tphysically\tselect\titems\tin\ta\tstore.\tSales\tto\tcustomers\twho\torder\tgoods\tonline\tfor\tdelivery\tor\tpickup\tat\tour\tphysical\nstores\tare\tincluded\tin\t“Online\tstores.”\n(3)\nIncludes\tcommissions\tand\tany\trelated\tfulfillment\tand\tshipping\tfees,\tand\tother\tthird-party\tseller\tservices.\n(4)\nIncludes\tsales\tof\tadvertising\tservices\tto\tsellers,\tvendors,\tpublishers,\tauthors,\tand\tothers,\tthrough\tprograms\tsuch\tas\tsponsored\tads,\tdisplay,\tand\tvideo\tadvertising.\n(5)\nIncludes\tannual\tand\tmonthly\tfees\tassociated\twith\tAmazon\tPrime\tmemberships,\tas\twell\tas\tdigital\tvideo,\taudiobook,\tdigital\tmusic,\te-book,\tand\tother\tnon-AWS\nsubscription\tservices.\n(6)\nIncludes\tsales\trelated\tto\tvarious\tother\tofferings,\tsuch\tas\tcertain\tlicensing\tand\tdistribution\tof\tvideo\tcontent,\thealth\tcare\tservices,\tand\tshipping\tservices,\tand\tour\tco-\nbranded\tcredit\tcard\tagreements.\nNet\tsales\tare\tattributed\tto\tcountries\tprimarily\tbased\ton\tcountry-focused\tonline\tand\tphysical\tstores\tor,\tfor\tAWS\tpurposes,\tthe\tselling\tentity.\t\nNet\tsales\tattributed\tto\ncountries\tthat\trepresent\ta\tsignificant\tportion\tof\tconsolidated\tnet\tsales\tare\tas\tfollows\t(in\tmillions):\n\t\nYear\tEnded\tDecember\t31,\n\t\n2021\n2022\n2023\nUnited\tStates\n$\n314,006\n\t\n$\n356,113\n\t\n$\n395,637\n\t\nGermany\n37,326\n\t\n33,598\n\t\n37,588\n\t\nUnited\tKingdom\n31,914\n\t\n30,074\n\t\n33,591\n\t\nJapan\n23,071\n\t\n24,396\n\t\n26,002\n\t\nRest\tof\tworld\n63,505\n\t\n69,802\n\t\n81,967\n\t\nConsolidated\n$\n469,822\n\t\n$\n513,983\n\t\n$\n574,785\n\t\n69",
                "source_num": 2,
                "page": "69",
            },
        ],
    }

    separated_text = re.sub(r"\[(\d+(?:,\s*\d+)*)\]", separate_numbers, res["text"])
    print(separated_text)
    # # Extract citations using the regular expression
    numbers = re.findall(r"\[(\d+)\]", separated_text)

    # # Remove duplicates using set and convert back to a list
    unique_numbers = list(set(numbers))

    # # Sort the list in ascending order
    unique_numbers.sort()

    # TODO: combine them and add destructuring
    existing_citations_nums = [
        node["source_num"]
        for node in res["nodes"]
        if node["node_id"] in citations_ids
        and str(node["source_num"]) in unique_numbers
    ]

    existing_citations_ids = [
        node["node_id"]
        for node in res["nodes"]
        if node["node_id"] in citations_ids
        and str(node["source_num"]) in unique_numbers
    ]

    referenced_nodes = [
        node
        for node in res["nodes"]
        if str(node["source_num"]) in unique_numbers
        and node["node_id"] not in existing_citations_ids
    ]

    # TODO: fetch supabase data for referenced nodes only
    # data = (
    #     service_client.table("documents")
    #     .select("*")
    #     .eq("id", node.node.extra_info["db_document_id"])
    #     .execute()
    # )
    # parent_doc = data.data[0]

    # enriched_referenced_nodes = [{"node_id": node["node_id"], "text": node["text"], "source_num": node["source_num"], "page": } for node in referenced_nodes]
    # nodes.append(
    #     {
    #         "node_id": node.id_,
    #         "text": node.get_text(),
    #         "source_num": citation_num,
    #         "page": node.node.extra_info["page_label"],
    #         "url": parent_doc["url"],
    #         "doc_type": parent_doc["doc_type"],
    #         "company_name": parent_doc["company_name"],
    #         "company_ticker": parent_doc["company_ticker"],
    #         "year": parent_doc["year"],
    #         # TODO: when null is returned from db, convert it to None
    #         "quarter": (
    #             None if parent_doc["quarter"] == null else parent_doc["quarter"]
    #         ),
    #     }
    # )

    def orig_citation(match):
        number = int(match.group(1))
        return f"[orig_{number}]"

    for num in existing_citations_nums:
        separated_text = re.sub(rf"\[({num})\]", orig_citation, separated_text)

    def increase_citation(match):
        number = int(match.group(1))
        new_number = number + offset
        return f"[{new_number}]"

    no_dupl_unique_nums = [
        num for num in unique_numbers if int(num) not in existing_citations_nums
    ]

    for new_num, old_num in enumerate(no_dupl_unique_nums, start=1):
        separated_text = separated_text.replace(f"[{old_num}]", f"[{new_num}]")
        for node in referenced_nodes:
            if node["source_num"] == int(old_num):
                node["source_num"] = new_num

    separated_text = re.sub(r"\[(\d+)\]", increase_citation, separated_text)

    for node in referenced_nodes:
        node["source_num"] = node["source_num"] + offset

    def unorig_citation(match):
        number = int(match.group(1).split("_")[1])
        id_index = existing_citations_ids[existing_citations_nums.index(number)]
        orig_num = citations_nums[citations_ids.index(id_index)]
        return f"[{orig_num}]"

    for num in existing_citations_nums:
        separated_text = re.sub(rf"\[(orig_{num})\]", unorig_citation, separated_text)

    final_text = ""
    sentences = separated_text.split(".")

    # Ensure all citations are in the ascending order
    for index, sentence in enumerate(sentences):
        # Find all the numbers inside brackets using regex
        brackets = re.findall(r"\[(\d+)\]", sentence)
        if not brackets:
            if index == len(sentences) - 1:
                final_text += sentence
            else:
                final_text += sentence + "."
            continue

        # Convert the numbers to integers and sort them in ascending order
        sorted_brackets = sorted(map(int, brackets))

        i = -1

        def substitute(match):
            nonlocal i
            i += 1
            return f"[{str(sorted_brackets[i])}]"

        # Replace each number inside brackets with its sorted position
        sentence = re.sub(rf"\[(\d+)\]", substitute, sentence)

        if index == len(sentences) - 1:
            final_text += sentence
        else:
            final_text += sentence + "."

    return {"response": final_text, "nodes": referenced_nodes}
