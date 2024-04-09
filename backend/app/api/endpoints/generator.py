from fastapi import Depends, APIRouter, HTTPException, status
from app.reports.engine import get_reports_engine
import logging
import re
from typing import List

from pydantic import BaseModel

router = APIRouter()
logger = logging.getLogger(__name__)

# TODO: this code really needs to be tested


def separate_numbers(match):
    numbers = match.group(1)
    return "".join([f"[{num}]" for num in numbers.split(", ")])


class Citation(BaseModel):
    source_id: int
    node_id: str


class PromptConfig(BaseModel):
    prompt_type: str
    offset: int
    citations: List[Citation]


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
    # res = get_reports_engine("0001018724")
    res = {
        "text": "Amazon.com, Inc., founded in 1994, is a multinational technology company primarily operating in the e-commerce, cloud computing, and digital entertainment industries. The company's key products and services include online retail, third-party seller services, Amazon Web Services (AWS), and subscription services, with 2023 net sales of $352.8 billion (61%) from North America, $131.2 billion (23%) from International, and $90.8 billion (16%) from AWS [3, 4, 7]. Amazon's major offerings include online stores, physical stores, third-party seller services, advertising services, and subscription services [9]. As of 2023, Amazon reported total net sales of $574.8 billion, a 12% increase from the previous year, serving customers worldwide [4, 9].",
        "nodes": [
            {
                "node_id": "c931dc9e-60b2-4430-aeac-fce2471c5062",
                "text": "Business\tand\tIndustry\tRisks\nWe\tFace\tIntense\tCompetition\nOur\tbusinesses\tare\trapidly\tevolving\tand\tintensely\tcompetitive,\tand\twe\thave\tmany\tcompetitors\tacross\tgeographies,\tincluding\tcross-border\tcompetition,\tand\tin\ndifferent\tindustries,\tincluding\tphysical,\te-commerce,\tand\tomnichannel\tretail,\te-commerce\tservices,\tweb\tand\tinfrastructure\tcomputing\tservices,\telectronic\tdevices,\tdigital\ncontent,\tadvertising,\tgrocery,\tand\ttransportation\tand\tlogistics\tservices.\tSome\tof\tour\tcurrent\tand\tpotential\tcompetitors\thave\tgreater\tresources,\tlonger\thistories,\tmore\ncustomers,\tand/or\tgreater\tbrand\trecognition,\tparticularly\twith\tour\tnewly-launched\tproducts\tand\tservices\tand\tin\tour\tnewer\tgeographic\tregions.\tThey\tmay\tsecure\tbetter\nterms\tfrom\tvendors,\tadopt\tmore\taggressive\tpricing,\tand\tdevote\tmore\tresources\tto\ttechnology,\tinfrastructure,\tfulfillment,\tand\tmarketing.\nCompetition\tcontinues\tto\tintensify,\tincluding\twith\tthe\tdevelopment\tof\tnew\tbusiness\tmodels\tand\tthe\tentry\tof\tnew\tand\twell-funded\tcompetitors,\tand\tas\tour\ncompetitors\tenter\tinto\tbusiness\tcombinations\tor\talliances\tand\testablished\tcompanies\tin\tother\tmarket\tsegments\texpand\tto\tbecome\tcompetitive\twith\tour\tbusiness.\tIn\naddition,\tnew\tand\tenhanced\ttechnologies,\tincluding\tsearch,\tweb\tand\tinfrastructure\tcomputing\tservices,\tpractical\tapplications\tof\tartificial\tintelligence\tand\tmachine\nlearning,\tdigital\tcontent,\tand\telectronic\tdevices\tcontinue\tto\tincrease\tour\tcompetition.\tThe\tinternet\tfacilitates\tcompetitive\tentry\tand\tcomparison\tshopping,\twhich\nenhances\tthe\tability\tof\tnew,\tsmaller,\tor\tlesser\tknown\tbusinesses\tto\tcompete\tagainst\tus.\tAs\ta\tresult\tof\tcompetition,\tour\tproduct\tand\tservice\tofferings\tmay\tnot\tbe\nsuccessful,\twe\tmay\tfail\tto\tgain\tor\tmay\tlose\tbusiness,\tand\twe\tmay\tbe\trequired\tto\tincrease\tour\tspending\tor\tlower\tprices,\tany\tof\twhich\tcould\tmaterially\treduce\tour\tsales\nand\tprofits.\nOur\tExpansion\tinto\tNew\tProducts,\tServices,\tTechnologies,\tand\tGeographic\tRegions\tSubjects\tUs\tto\tAdditional\tRisks\nWe\tmay\thave\tlimited\tor\tno\texperience\tin\tour\tnewer\tmarket\tsegments,\tand\tour\tcustomers\tmay\tnot\tadopt\tour\tproduct\tor\tservice\tofferings.\tThese\tofferings,\twhich\ncan\tpresent\tnew\tand\tdifficult\ttechnology\tchallenges,\tmay\tsubject\tus\tto\tclaims\tif\tcustomers\tof\tthese\tofferings\texperience,\tor\tare\totherwise\timpacted\tby,\tservice\ndisruptions,\tdelays,\tsetbacks,\tor\tfailures\tor\tquality\tissues.\tIn\taddition,\tprofitability\tor\tother\tintended\tbenefits,\tif\tany,\tin\tour\tnewer\tactivities\tmay\tnot\tmeet\tour\nexpectations,\tand\twe\tmay\tnot\tbe\tsuccessful\tenough\tin\tthese\tnewer\tactivities\tto\trecoup\tour\tinvestments\tin\tthem,\twhich\tinvestments\tare\toften\tsignificant.\tFailure\tto\nrealize\tthe\tbenefits\tof\tamounts\twe\tinvest\tin\tnew\ttechnologies,\tproducts,\tor\tservices\tcould\tresult\tin\tthe\n6",
                "source_num": 1,
                "page": "6",
                "url": "sec-edgar-filings/0001018724/10-K/0001018724-24-000008/primary-document.pdf",
                "doc_type": "10-K",
                "company_name": "Amazon.com, Inc.",
                "company_ticker": "AMZN",
                "year": 2023,
                "quarter": None,
            },
            {
                "node_id": "a52eb6aa-5dbc-49c4-b894-0652f0140962",
                "text": "Table\tof\tContents\nCompetition\nOur\tbusinesses\tencompass\ta\tlarge\tvariety\tof\tproduct\ttypes,\tservice\tofferings,\tand\tdelivery\tchannels.\tThe\tworldwide\tmarketplace\tin\twhich\twe\tcompete\tis\tevolving\nrapidly\tand\tintensely\tcompetitive,\tand\twe\tface\ta\tbroad\tarray\tof\tcompetitors\tfrom\tmany\tdifferent\tindustry\tsectors\taround\tthe\tworld.\tOur\tcurrent\tand\tpotential\ncompetitors\tinclude:\t(1)\tphysical,\te-commerce,\tand\tomnichannel\tretailers,\tpublishers,\tvendors,\tdistributors,\tmanufacturers,\tand\tproducers\tof\tthe\tproducts\twe\toffer\tand\nsell\tto\tconsumers\tand\tbusinesses;\t(2)\tpublishers,\tproducers,\tand\tdistributors\tof\tphysical,\tdigital,\tand\tinteractive\tmedia\tof\tall\ttypes\tand\tall\tdistribution\tchannels;\t(3)\tweb\nsearch\tengines,\tcomparison\tshopping\twebsites,\tsocial\tnetworks,\tweb\tportals,\tand\tother\tonline\tand\tapp-based\tmeans\tof\tdiscovering,\tusing,\tor\tacquiring\tgoods\tand\nservices,\teither\tdirectly\tor\tin\tcollaboration\twith\tother\tretailers;\t(4)\tcompanies\tthat\tprovide\te-commerce\tservices,\tincluding\twebsite\tdevelopment\tand\thosting,\nomnichannel\tsales,\tinventory\tand\tsupply\tchain\tmanagement,\tadvertising,\tfulfillment,\tcustomer\tservice,\tand\tpayment\tprocessing;\t(5)\tcompanies\tthat\tprovide\tfulfillment\nand\tlogistics\tservices\tfor\tthemselves\tor\tfor\tthird\tparties,\twhether\tonline\tor\toffline;\t(6)\tcompanies\tthat\tprovide\tinformation\ttechnology\tservices\tor\tproducts,\tincluding\ton-\npremises\tor\tcloud-based\tinfrastructure\tand\tother\tservices;\t(7)\tcompanies\tthat\tdesign,\tmanufacture,\tmarket,\tor\tsell\tconsumer\telectronics,\ttelecommunication,\tand\nelectronic\tdevices;\t(8)\tcompanies\tthat\tsell\tgrocery\tproducts\tonline\tand\tin\tphysical\tstores;\tand\t(9)\tcompanies\tthat\tprovide\tadvertising\tservices,\twhether\tin\tdigital\tor\tother\nformats.\tWe\tbelieve\tthat\tthe\tprincipal\tcompetitive\tfactors\tin\tour\tretail\tbusinesses\tinclude\tselection,\tprice,\tand\tconvenience,\tincluding\tfast\tand\treliable\tfulfillment.\nAdditional\tcompetitive\tfactors\tfor\tour\tseller\tand\tenterprise\tservices\tinclude\tthe\tquality,\tspeed,\tand\treliability\tof\tour\tservices\tand\ttools,\tas\twell\tas\tcustomers’\tability\tand\nwillingness\tto\tchange\tbusiness\tpractices.\tSome\tof\tour\tcurrent\tand\tpotential\tcompetitors\thave\tgreater\tresources,\tlonger\thistories,\tmore\tcustomers,\tgreater\tbrand\nrecognition,\tand\tgreater\tcontrol\tover\tinputs\tcritical\tto\tour\tvarious\tbusinesses.\tThey\tmay\tsecure\tbetter\tterms\tfrom\tsuppliers,\tadopt\tmore\taggressive\tpricing,\tpursue\nrestrictive\tdistribution\tagreements\tthat\trestrict\tour\taccess\tto\tsupply,\tdirect\tconsumers\tto\ttheir\town\tofferings\tinstead\tof\tours,\tlock-in\tpotential\tcustomers\twith\trestrictive\nterms,\tand\tdevote\tmore\tresources\tto\ttechnology,\tinfrastructure,\tfulfillment,\tand\tmarketing.\tThe\tinternet\tfacilitates\tcompetitive\tentry\tand\tcomparison\tshopping,\twhich\nenhances\tthe\tability\tof\tnew,\tsmaller,\tor\tlesser-known\tbusinesses\tto\tcompete\tagainst\tus.\tEach\tof\tour\tbusinesses\tis\talso\tsubject\tto\trapid\tchange\tand\tthe\tdevelopment\tof\nnew\tbusiness\tmodels\tand\tthe\tentry\tof\tnew\tand\twell-funded\tcompetitors.\tOther\tcompanies\talso\tmay\tenter\tinto\tbusiness\tcombinations\tor\talliances\tthat\tstrengthen\ttheir\ncompetitive\tpositions.",
                "source_num": 2,
                "page": "4",
                "url": "sec-edgar-filings/0001018724/10-K/0001018724-24-000008/primary-document.pdf",
                "doc_type": "10-K",
                "company_name": "Amazon.com, Inc.",
                "company_ticker": "AMZN",
                "year": 2023,
                "quarter": None,
            },
            {
                "node_id": "81b9e404-069a-4528-b7eb-434494aba64c",
                "text": "Table\tof\tContents\nNote\t10\t—\t\nSEGMENT\tINFORMATION\nWe\thave\torganized\tour\toperations\tinto\t\nthree\n\tsegments:\tNorth\tAmerica,\tInternational,\tand\tAWS.\tWe\tallocate\tto\tsegment\tresults\tthe\toperating\texpenses\n“Fulfillment,”\t“Technology\tand\tinfrastructure,”\t“Sales\tand\tmarketing,”\tand\t“General\tand\tadministrative”\tbased\ton\tusage,\twhich\tis\tgenerally\treflected\tin\tthe\tsegment\tin\nwhich\tthe\tcosts\tare\tincurred.\tThe\tmajority\tof\ttechnology\tcosts\trecorded\tin\t“Technology\tand\tinfrastructure”\tare\tincurred\tin\tthe\tU.S.\tand\tare\tincluded\tin\tour\tNorth\nAmerica\tand\tAWS\tsegments.\tThe\tmajority\tof\tinfrastructure\tcosts\trecorded\tin\t“Technology\tand\tinfrastructure”\tare\tallocated\tto\tthe\tAWS\tsegment\tbased\ton\tusage.\tThere\nare\tno\tinternal\trevenue\ttransactions\tbetween\tour\treportable\tsegments.\tOur\tchief\toperating\tdecision\tmaker\t(“CODM”)\tregularly\treviews\tconsolidated\tnet\tsales,\nconsolidated\toperating\texpenses,\tand\tconsolidated\toperating\tincome\t(loss)\tby\tsegment.\tAmounts\tincluded\tin\tconsolidated\toperating\texpenses\tinclude\t“Cost\tof\tsales,”\n“Fulfillment,”\t“Technology\tand\tinfrastructure,”\t“Sales\tand\tmarketing,”\t“General\tand\tadministrative,”\tand\t“Other\toperating\texpense\t(income),\tnet.”\tOur\tCODM\nmanages\tour\tbusiness\tby\treviewing\tannual\tforecasts\tand\tconsolidated\tresults\tby\tsegment\ton\ta\tquarterly\tbasis.\nNorth\tAmerica\nThe\tNorth\tAmerica\tsegment\tprimarily\tconsists\tof\tamounts\tearned\tfrom\tretail\tsales\tof\tconsumer\tproducts\t(including\tfrom\tsellers)\tand\tadvertising\tand\tsubscription\nservices\tthrough\tNorth\tAmerica-focused\tonline\tand\tphysical\tstores.\tThis\tsegment\tincludes\texport\tsales\tfrom\tthese\tonline\tstores.\nInternational\nThe\tInternational\tsegment\tprimarily\tconsists\tof\tamounts\tearned\tfrom\tretail\tsales\tof\tconsumer\tproducts\t(including\tfrom\tsellers)\tand\tadvertising\tand\tsubscription\nservices\tthrough\tinternationally-focused\tonline\tstores.\tThis\tsegment\tincludes\texport\tsales\tfrom\tthese\tinternationally-focused\tonline\tstores\t(including\texport\tsales\tfrom\nthese\tonline\tstores\tto\tcustomers\tin\tthe\tU.S.,\tMexico,\tand\tCanada),\tbut\texcludes\texport\tsales\tfrom\tour\tNorth\tAmerica-focused\tonline\tstores.\nAWS\nThe\tAWS\tsegment\tconsists\tof\tamounts\tearned\tfrom\tglobal\tsales\tof\tcompute,\tstorage,\tdatabase,\tand\tother\tservices\tfor\tstart-ups,\tenterprises,\tgovernment\tagencies,\nand\tacademic\tinstitutions.",
                "source_num": 3,
                "page": "68",
                "url": "sec-edgar-filings/0001018724/10-K/0001018724-24-000008/primary-document.pdf",
                "doc_type": "10-K",
                "company_name": "Amazon.com, Inc.",
                "company_ticker": "AMZN",
                "year": 2023,
                "quarter": None,
            },
            {
                "node_id": "fb0a6d20-60d1-4486-9aa5-6543f2bb9cd1",
                "text": "Table\tof\tContents\nResults\tof\tOperations\nWe\thave\torganized\tour\toperations\tinto\tthree\tsegments:\tNorth\tAmerica,\tInternational,\tand\tAWS.\tThese\tsegments\treflect\tthe\tway\tthe\tCompany\tevaluates\tits\nbusiness\tperformance\tand\tmanages\tits\toperations.\tSee\tItem\t8\tof\tPart\tII,\t“Financial\tStatements\tand\tSupplementary\tData\t—\tNote\t10\t—\tSegment\tInformation.”\nOverview\nMacroeconomic\tfactors,\tincluding\tinflation,\tincreased\tinterest\trates,\tsignificant\tcapital\tmarket\tand\tsupply\tchain\tvolatility,\tand\tglobal\teconomic\tand\tgeopolitical\ndevelopments,\thave\tdirect\tand\tindirect\timpacts\ton\tour\tresults\tof\toperations\tthat\tare\tdifficult\tto\tisolate\tand\tquantify.\tIn\taddition,\tchanges\tin\tfuel,\tutility,\tand\tfood\tcosts,\ninterest\trates,\tand\teconomic\toutlook\tmay\timpact\tcustomer\tdemand\tand\tour\tability\tto\tforecast\tconsumer\tspending\tpatterns.\tWe\talso\texpect\tthe\tcurrent\tmacroeconomic\nenvironment\tand\tenterprise\tcustomer\tcost\toptimization\tefforts\tto\timpact\tour\tAWS\trevenue\tgrowth\trates.\tWe\texpect\tsome\tor\tall\tof\tthese\tfactors\tto\tcontinue\tto\timpact\tour\noperations\tinto\tQ1\t2024.\nNet\tSales\nNet\tsales\tinclude\tproduct\tand\tservice\tsales.\tProduct\tsales\trepresent\trevenue\tfrom\tthe\tsale\tof\tproducts\tand\trelated\tshipping\tfees\tand\tdigital\tmedia\tcontent\twhere\twe\nrecord\trevenue\tgross.\tService\tsales\tprimarily\trepresent\tthird-party\tseller\tfees,\twhich\tincludes\tcommissions\tand\tany\trelated\tfulfillment\tand\tshipping\tfees,\tAWS\tsales,\nadvertising\tservices,\tAmazon\tPrime\tmembership\tfees,\tand\tcertain\tdigital\tmedia\tcontent\tsubscriptions.\tNet\tsales\tinformation\tis\tas\tfollows\t(in\tmillions):\n\t\n\t\nYear\tEnded\tDecember\t31,\n\t\n2022\n2023\nNet\tSales:\nNorth\tAmerica\n$\n315,880\t\n$\n352,828\t\nInternational\n118,007\t\n131,200\t\nAWS\n80,096\t\n90,757\t\nConsolidated\n$\n513,983\t\n$\n574,785\t\nYear-over-year\tPercentage\tGrowth\t(Decline):\nNorth\tAmerica\n13\t\n%\n12\t\n%\nInternational\n(8)\n11\t\nAWS\n29\t\n13\t\nConsolidated\n9\t\n12\t\nYear-over-year\tPercentage\tGrowth,\texcluding\tthe\teffect\tof\tforeign\texchange\trates:\nNorth\tAmerica\n13\t\n%\n12\t\n%\nInternational\n4\t\n11\t\nAWS\n29\t\n13\t\nConsolidated\n13\t\n12\t\nNet\tSales\tMix:\nNorth\tAmerica\n61\t\n%\n61\t\n%\nInternational\n23\t\n23\t\nAWS\n16\t\n16\t\nConsolidated\n100\t\n%\n100\t\n%\nSales\tincreased\t12%\tin\t2023,\tcompared\tto\tthe\tprior\tyear.\tChanges\tin\tforeign\texchange\trates\treduced\tnet\tsales\tby\t$71\tmillion\tin\t2023.\tFor\ta\tdiscussion\tof\tthe\neffect\tof\tforeign\texchange\trates\ton\tsales\tgrowth,\tsee\t“Effect\tof\tForeign\tExchange\tRates”\tbelow.\nNorth\tAmerica\tsales\tincreased\t12%\tin\t2023,\tcompared\tto\tthe\tprior\tyear.\tThe\tsales\tgrowth\tprimarily\treflects\tincreased\tunit\tsales,\tprimarily\tby\tthird-party\tsellers,\nadvertising\tsales,\tand\tsubscription\tservices.\tIncreased\tunit\tsales\twere\tdriven\tlargely\tby\tour\tcontinued\tfocus\ton\tprice,\tselection,\tand\tconvenience\tfor\tour\tcustomers,\nincluding\tfrom\tour\tshipping\toffers.\nInternational\tsales\tincreased\t11%\tin\t2023,\tcompared\tto\tthe\tprior\tyear.\tThe\tsales\tgrowth\tprimarily\treflects\tincreased\tunit\tsales,\tprimarily\tby\tthird-party\tsellers,\nadvertising\tsales,\tand\tsubscription\tservices.",
                "source_num": 4,
                "page": "24",
                "url": "sec-edgar-filings/0001018724/10-K/0001018724-24-000008/primary-document.pdf",
                "doc_type": "10-K",
                "company_name": "Amazon.com, Inc.",
                "company_ticker": "AMZN",
                "year": 2023,
                "quarter": None,
            },
            {
                "node_id": "2015c8f9-97dc-4d46-9398-486e00ad7a83",
                "text": "Table\tof\tContents\nAdvertising\tservices\n\t-\tWe\tprovide\tadvertising\tservices\tto\tsellers,\tvendors,\tpublishers,\tauthors,\tand\tothers,\tthrough\tprograms\tsuch\tas\tsponsored\tads,\tdisplay,\tand\nvideo\tadvertising.\tRevenue\tis\trecognized\tas\tads\tare\tdelivered\tbased\ton\tthe\tnumber\tof\tclicks\tor\timpressions.\nSubscription\tservices\n\t-\tOur\tsubscription\tsales\tinclude\tfees\tassociated\twith\tAmazon\tPrime\tmemberships\tand\taccess\tto\tcontent\tincluding\tdigital\tvideo,\taudiobooks,\ndigital\tmusic,\te-books,\tand\tother\tnon-AWS\tsubscription\tservices.\tPrime\tmemberships\tprovide\tour\tcustomers\twith\taccess\tto\tan\tevolving\tsuite\tof\tbenefits\tthat\trepresent\ta\nsingle\tstand-ready\tobligation.\tSubscriptions\tare\tpaid\tfor\tat\tthe\ttime\tof\tor\tin\tadvance\tof\tdelivering\tthe\tservices.\tRevenue\tfrom\tsuch\tarrangements\tis\trecognized\tover\tthe\nsubscription\tperiod.\nAWS\n\t-\tOur\tAWS\tarrangements\tinclude\tglobal\tsales\tof\tcompute,\tstorage,\tdatabase,\tand\tother\tservices.\tRevenue\tis\tallocated\tto\tservices\tusing\tstand-alone\tselling\nprices\tand\tis\tprimarily\trecognized\twhen\tthe\tcustomer\tuses\tthese\tservices,\tbased\ton\tthe\tquantity\tof\tservices\trendered,\tsuch\tas\tcompute\tor\tstorage\tcapacity\tdelivered\ton-\ndemand.\tCertain\tservices,\tincluding\tcompute\tand\tdatabase,\tare\talso\toffered\tas\ta\tfixed\tquantity\tover\ta\tspecified\tterm,\tfor\twhich\trevenue\tis\trecognized\tratably.\tSales\ncommissions\twe\tpay\tin\tconnection\twith\tcontracts\tthat\texceed\tone\tyear\tare\tcapitalized\tand\tamortized\tover\tthe\tcontract\tterm.\nOther\n\t-\tOther\trevenue\tincludes\tsales\trelated\tto\tvarious\tother\tofferings,\tsuch\tas\tcertain\tlicensing\tand\tdistribution\tof\tvideo\tcontent,\thealth\tcare\tservices,\tand\nshipping\tservices,\tand\tour\tco-branded\tcredit\tcard\tagreements.\tRevenue\tis\trecognized\twhen\tcontent\tis\tlicensed\tor\tdistributed\tand\tas\tor\twhen\tservices\tare\tperformed.\nReturn\tAllowances\nReturn\tallowances,\twhich\treduce\trevenue\tand\tcost\tof\tsales,\tare\testimated\tusing\thistorical\texperience.\tLiabilities\tfor\treturn\tallowances\tare\tincluded\tin\t“Accrued\nexpenses\tand\tother”\tand\twere\t$\n1.0\n\tbillion,\t$\n1.3\n\tbillion,\tand\t$\n1.4\n\tbillion\tas\tof\tDecember\t31,\t2021,\t2022,\tand\t2023.\tAdditions\tto\tthe\tallowance\twere\t$\n5.1\n\tbillion,\t$\n5.5\nbillion,\tand\t$\n5.2\n\tbillion\tand\tdeductions\tfrom\tthe\tallowance\twere\t$\n4.9\n\tbillion,\t$\n5.2\n\tbillion,\tand\t$\n5.1\n\tbillion\tin\t2021,\t2022,\tand\t2023.\tIncluded\tin\t“Inventories”\ton\tour\nconsolidated\tbalance\tsheets\tare\tassets\ttotaling\t$\n882\n\tmillion,\t$\n948\n\tmillion,\tand\t$\n992\n\tmillion\tas\tof\tDecember\t31,\t2021,\t2022,\tand\t2023,\tfor\tthe\trights\tto\trecover\tproducts\nfrom\tcustomers\tassociated\twith\tour\tliabilities\tfor\treturn\tallowances.\nCost\tof\tSales\nCost\tof\tsales\tprimarily\tconsists\tof\tthe\tpurchase\tprice\tof\tconsumer\tproducts,\tinbound\tand\toutbound\tshipping\tcosts,\tincluding\tcosts\trelated\tto\tsortation\tand\tdelivery\ncenters\tand\twhere\twe\tare\tthe\ttransportation\tservice\tprovider,\tand\tdigital\tmedia\tcontent\tcosts\twhere\twe\trecord\trevenue\tgross,\tincluding\tvideo\tand\tmusic.\tShipping\tcosts\nto\treceive\tproducts\tfrom\tour\tsuppliers\tare\tincluded\tin\tour\tinventory,\tand\trecognized\tas\tcost\tof\tsales\tupon\tsale\tof\tproducts\tto\tour\tcustomers.",
                "source_num": 5,
                "page": "44",
                "url": "sec-edgar-filings/0001018724/10-K/0001018724-24-000008/primary-document.pdf",
                "doc_type": "10-K",
                "company_name": "Amazon.com, Inc.",
                "company_ticker": "AMZN",
                "year": 2023,
                "quarter": None,
            },
            {
                "node_id": "ec7a88f8-5c3b-46f0-8645-4fbc912ffd70",
                "text": "Table\tof\tContents\n•\nchanges\tin\tusage\tor\tadoption\trates\tof\tthe\tinternet,\te-commerce,\telectronic\tdevices,\tand\tweb\tservices,\tincluding\toutside\tthe\tU.S.\n•\ntiming,\teffectiveness,\tand\tcosts\tof\texpansion\tand\tupgrades\tof\tour\tsystems\tand\tinfrastructure;\n•\nthe\tsuccess\tof\tour\tgeographic,\tservice,\tand\tproduct\tline\texpansions;\n•\nthe\textent\tto\twhich\twe\tfinance,\tand\tthe\tterms\tof\tany\tsuch\tfinancing\tfor,\tour\tcurrent\toperations\tand\tfuture\tgrowth;\n•\nthe\toutcomes\tof\tlegal\tproceedings\tand\tclaims,\twhich\tmay\tinclude\tsignificant\tmonetary\tdamages\tor\tinjunctive\trelief\tand\tcould\thave\ta\tmaterial\tadverse\timpact\non\tour\toperating\tresults;\n•\nvariations\tin\tthe\tmix\tof\tproducts\tand\tservices\twe\tsell;\n•\nvariations\tin\tour\tlevel\tof\tmerchandise\tand\tvendor\treturns;\n•\nthe\textent\tto\twhich\twe\toffer\tfast\tand\tfree\tdelivery,\tcontinue\tto\treduce\tprices\tworldwide,\tand\tprovide\tadditional\tbenefits\tto\tour\tcustomers;\n•\nfactors\taffecting\tour\treputation\tor\tbrand\timage\t(including\tany\tactual\tor\tperceived\tinability\tto\tachieve\tour\tgoals\tor\tcommitments,\twhether\trelated\tto\nsustainability,\tcustomers,\temployees,\tor\tother\ttopics),\tand\tpublic\tperceptions\tregarding\tsocial\tor\tethical\tissues\trelated\tto\tour\tdevelopment\tand\tuse\tof\tartificial\nintelligence\tand\tmachine\tlearning\ttechnologies,\tproducts,\tand\tservices;\n•\nthe\textent\tto\twhich\twe\tinvest\tin\ttechnology\tand\tinfrastructure,\tfulfillment,\tand\tother\texpense\tcategories;\n•\navailability\tof\tand\tincreases\tin\tthe\tprices\tof\ttransportation\t(including\tfuel),\tresources\tsuch\tas\tland,\twater,\tand\tenergy,\tcommodities\tlike\tpaper\tand\tpacking\nsupplies\tand\thardware\tproducts,\tand\ttechnology\tinfrastructure\tproducts,\tincluding\tas\ta\tresult\tof\tinflationary\tpressures;\n•\nconstrained\tlabor\tmarkets,\twhich\tincrease\tour\tpayroll\tcosts;\n•\nthe\textent\tto\twhich\toperators\tof\tthe\tnetworks\tbetween\tour\tcustomers\tand\tour\tstores\tsuccessfully\tcharge\tfees\tto\tgrant\tour\tcustomers\tunimpaired\tand\nunconstrained\taccess\tto\tour\tonline\tservices;\n•\nour\tability\tto\tcollect\tamounts\towed\tto\tus\twhen\tthey\tbecome\tdue;\n•\nthe\textent\tto\twhich\tnew\tand\texisting\ttechnologies,\tor\tindustry\ttrends,\trestrict\tonline\tadvertising\tor\taffect\tour\tability\tto\tcustomize\tadvertising\tor\totherwise\ntailor\tour\tproduct\tand\tservice\tofferings;\n•\nthe\textent\tto\twhich\tuse\tof\tour\tservices\tis\taffected\tby\tspyware,\tviruses,\tphishing\tand\tother\tspam\temails,\tdenial\tof\tservice\tattacks,\tdata\ttheft,\tcomputer\nintrusions,\toutages,\tand\tsimilar\tevents;\n•\nthe\textent\tto\twhich\twe\tfail\tto\tmaintain\tour\tunique\tculture\tof\tinnovation,\tcustomer\tobsession,\tand\tlong-term\tthinking,\twhich\thas\tbeen\tcritical\tto\tour\tgrowth\nand\tsuccess;\n•\ndisruptions\tfrom\tnatural\tor\thuman-caused\tdisasters\t(including\tpublic\thealth\tcrises)\tor\textreme\tweather\t(including\tas\ta\tresult\tof\tclimate\tchange),\tgeopolitical\nevents\tand\tsecurity\tissues\t(including\tterrorist\tattacks,\tarmed\thostilities,\tand\tpolitical\tconflicts,\tincluding\tthose\tinvolving\tChina),\tlabor\tor\ttrade\tdisputes\n(including\trestrictive\tgovernmental\tactions\timpacting\tus,\tour\tcustomers,\tand\tour\tthird-party\tsellers\tand\tsuppliers\tin\tChina\tor\tother\tforeign\tcountries),\tand\nsimilar\tevents;",
                "source_num": 6,
                "page": "10",
                "url": "sec-edgar-filings/0001018724/10-K/0001018724-24-000008/primary-document.pdf",
                "doc_type": "10-K",
                "company_name": "Amazon.com, Inc.",
                "company_ticker": "AMZN",
                "year": 2023,
                "quarter": None,
            },
            {
                "node_id": "fb0a6d20-60d1-4486-9aa5-6543f2bb9cd1",
                "text": "Table\tof\tContents\nResults\tof\tOperations\nWe\thave\torganized\tour\toperations\tinto\tthree\tsegments:\tNorth\tAmerica,\tInternational,\tand\tAWS.\tThese\tsegments\treflect\tthe\tway\tthe\tCompany\tevaluates\tits\nbusiness\tperformance\tand\tmanages\tits\toperations.\tSee\tItem\t8\tof\tPart\tII,\t“Financial\tStatements\tand\tSupplementary\tData\t—\tNote\t10\t—\tSegment\tInformation.”\nOverview\nMacroeconomic\tfactors,\tincluding\tinflation,\tincreased\tinterest\trates,\tsignificant\tcapital\tmarket\tand\tsupply\tchain\tvolatility,\tand\tglobal\teconomic\tand\tgeopolitical\ndevelopments,\thave\tdirect\tand\tindirect\timpacts\ton\tour\tresults\tof\toperations\tthat\tare\tdifficult\tto\tisolate\tand\tquantify.\tIn\taddition,\tchanges\tin\tfuel,\tutility,\tand\tfood\tcosts,\ninterest\trates,\tand\teconomic\toutlook\tmay\timpact\tcustomer\tdemand\tand\tour\tability\tto\tforecast\tconsumer\tspending\tpatterns.\tWe\talso\texpect\tthe\tcurrent\tmacroeconomic\nenvironment\tand\tenterprise\tcustomer\tcost\toptimization\tefforts\tto\timpact\tour\tAWS\trevenue\tgrowth\trates.\tWe\texpect\tsome\tor\tall\tof\tthese\tfactors\tto\tcontinue\tto\timpact\tour\noperations\tinto\tQ1\t2024.\nNet\tSales\nNet\tsales\tinclude\tproduct\tand\tservice\tsales.\tProduct\tsales\trepresent\trevenue\tfrom\tthe\tsale\tof\tproducts\tand\trelated\tshipping\tfees\tand\tdigital\tmedia\tcontent\twhere\twe\nrecord\trevenue\tgross.\tService\tsales\tprimarily\trepresent\tthird-party\tseller\tfees,\twhich\tincludes\tcommissions\tand\tany\trelated\tfulfillment\tand\tshipping\tfees,\tAWS\tsales,\nadvertising\tservices,\tAmazon\tPrime\tmembership\tfees,\tand\tcertain\tdigital\tmedia\tcontent\tsubscriptions.\tNet\tsales\tinformation\tis\tas\tfollows\t(in\tmillions):\n\t\n\t\nYear\tEnded\tDecember\t31,\n\t\n2022\n2023\nNet\tSales:\nNorth\tAmerica\n$\n315,880\t\n$\n352,828\t\nInternational\n118,007\t\n131,200\t\nAWS\n80,096\t\n90,757\t\nConsolidated\n$\n513,983\t\n$\n574,785\t\nYear-over-year\tPercentage\tGrowth\t(Decline):\nNorth\tAmerica\n13\t\n%\n12\t\n%\nInternational\n(8)\n11\t\nAWS\n29\t\n13\t\nConsolidated\n9\t\n12\t\nYear-over-year\tPercentage\tGrowth,\texcluding\tthe\teffect\tof\tforeign\texchange\trates:\nNorth\tAmerica\n13\t\n%\n12\t\n%\nInternational\n4\t\n11\t\nAWS\n29\t\n13\t\nConsolidated\n13\t\n12\t\nNet\tSales\tMix:\nNorth\tAmerica\n61\t\n%\n61\t\n%\nInternational\n23\t\n23\t\nAWS\n16\t\n16\t\nConsolidated\n100\t\n%\n100\t\n%\nSales\tincreased\t12%\tin\t2023,\tcompared\tto\tthe\tprior\tyear.\tChanges\tin\tforeign\texchange\trates\treduced\tnet\tsales\tby\t$71\tmillion\tin\t2023.\tFor\ta\tdiscussion\tof\tthe\neffect\tof\tforeign\texchange\trates\ton\tsales\tgrowth,\tsee\t“Effect\tof\tForeign\tExchange\tRates”\tbelow.\nNorth\tAmerica\tsales\tincreased\t12%\tin\t2023,\tcompared\tto\tthe\tprior\tyear.\tThe\tsales\tgrowth\tprimarily\treflects\tincreased\tunit\tsales,\tprimarily\tby\tthird-party\tsellers,\nadvertising\tsales,\tand\tsubscription\tservices.\tIncreased\tunit\tsales\twere\tdriven\tlargely\tby\tour\tcontinued\tfocus\ton\tprice,\tselection,\tand\tconvenience\tfor\tour\tcustomers,\nincluding\tfrom\tour\tshipping\toffers.\nInternational\tsales\tincreased\t11%\tin\t2023,\tcompared\tto\tthe\tprior\tyear.\tThe\tsales\tgrowth\tprimarily\treflects\tincreased\tunit\tsales,\tprimarily\tby\tthird-party\tsellers,\nadvertising\tsales,\tand\tsubscription\tservices.",
                "source_num": 7,
                "page": "24",
                "url": "sec-edgar-filings/0001018724/10-K/0001018724-24-000008/primary-document.pdf",
                "doc_type": "10-K",
                "company_name": "Amazon.com, Inc.",
                "company_ticker": "AMZN",
                "year": 2023,
                "quarter": None,
            },
            {
                "node_id": "14401539-c526-4d95-b316-68bd5d6a5cf2",
                "text": "Table\tof\tContents\nTotal\tsegment\tassets\texclude\tcorporate\tassets,\tsuch\tas\tcash\tand\tcash\tequivalents,\tmarketable\tsecurities,\tother\tlong-term\tinvestments,\tcorporate\tfacilities,\tgoodwill\nand\tother\tacquired\tintangible\tassets,\tand\ttax\tassets.\tTechnology\tinfrastructure\tassets\tare\tallocated\tamong\tthe\tsegments\tbased\ton\tusage,\twith\tthe\tmajority\tallocated\tto\tthe\nAWS\tsegment.\t\nTotal\tsegment\tassets\treconciled\tto\tconsolidated\tamounts\tare\tas\tfollows\t(in\tmillions):\n\t\nDecember\t31,\n\t\n2021\n2022\n2023\nNorth\tAmerica\t(1)\n$\n161,255\n\t\n$\n185,268\n\t\n$\n196,029\n\t\nInternational\t(1)\n57,983\n\t\n64,666\n\t\n69,718\n\t\nAWS\t(2)\n63,835\n\t\n88,491\n\t\n108,533\n\t\nCorporate\n137,476\n\t\n124,250\n\t\n153,574\n\t\nConsolidated\n$\n420,549\n\t\n$\n462,675\n\t\n$\n527,854\n\t\n___________________\n(1)\nNorth\tAmerica\tand\tInternational\tsegment\tassets\tprimarily\tconsist\tof\tproperty\tand\tequipment,\toperating\tleases,\tinventory,\taccounts\treceivable,\tand\tdigital\tvideo\tand\nmusic\tcontent.\n(2)\nAWS\tsegment\tassets\tprimarily\tconsist\tof\tproperty\tand\tequipment,\taccounts\treceivable,\tand\toperating\tleases.\nProperty\tand\tequipment,\tnet\tby\tsegment\tis\tas\tfollows\t(in\tmillions):\n\t\nDecember\t31,\n\t\n2021\n2022\n2023\nNorth\tAmerica\n$\n83,640\n\t\n$\n90,076\n\t\n$\n93,632\n\t\nInternational\n21,718\n\t\n23,347\n\t\n24,357\n\t\nAWS\n43,245\n\t\n60,324\n\t\n72,701\n\t\nCorporate\n11,678\n\t\n12,968\n\t\n13,487\n\t\nConsolidated\n$\n160,281\n\t\n$\n186,715\n\t\n$\n204,177\n\t\nTotal\tnet\tadditions\tto\tproperty\tand\tequipment\tby\tsegment\tare\tas\tfollows\t(in\tmillions):\n\t\nYear\tEnded\tDecember\t31,\n\t\n2021\n2022\n2023\nNorth\tAmerica\t(1)\n$\n37,397\n\t\n$\n23,682\n\t\n$\n17,529\n\t\nInternational\t(1)\n10,259\n\t\n6,711\n\t\n4,144\n\t\nAWS\t(2)\n22,047\n\t\n27,755\n\t\n24,843\n\t\nCorporate\n2,622\n\t\n2,688\n\t\n1,828\n\t\nConsolidated\n$\n72,325\n\t\n$\n60,836\n\t\n$\n48,344\n\t\n___________________\n(1)\nIncludes\tproperty\tand\tequipment\tadded\tunder\tfinance\tleases\tof\t$\n3.6\n\tbillion,\t$\n422\n\tmillion,\tand\t$\n525\n\tmillion\tin\t2021,\t2022,\tand\t2023,\tand\tunder\tbuild-to-suit\tlease\narrangements\tof\t$\n5.6\n\tbillion,\t$\n3.2\n\tbillion,\tand\t$\n356\n\tmillion\tin\t2021,\t2022,\tand\t2023.\n(2)\nIncludes\tproperty\tand\tequipment\tadded\tunder\tfinance\tleases\tof\t$\n3.5\n\tbillion,\t$\n253\n\tmillion,\tand\t$\n117\n\tmillion\tin\t2021,\t2022,\tand\t2023,\tand\tunder\tbuild-to-suit\tlease\narrangements\tof\t$\n51\n\tmillion,\t$\n20\n\tmillion,\tand\t$\n1\n\tmillion\tin\t2021,\t2022,\tand\t2023.\nU.S.\tproperty\tand\tequipment,\tnet\tand\toperating\tleases\twere\t$\n155.0\n\tbillion,\t$\n180.0\n\tbillion,\tand\t$\n196.0\n\tbillion,\tas\tof\tDecember\t31,\t2021,\t2022,\tand\t2023,\tand\tnon-\nU.S.\tproperty\tand\tequipment,\tnet\tand\toperating\tleases\twere\t$\n61.3\n\tbillion,\t$\n72.9\n\tbillion,\tand\t$\n80.7\n\tbillion\tas\tof\tDecember\t31,\t2021,\t2022,\tand\t2023.",
                "source_num": 8,
                "page": "70",
                "url": "sec-edgar-filings/0001018724/10-K/0001018724-24-000008/primary-document.pdf",
                "doc_type": "10-K",
                "company_name": "Amazon.com, Inc.",
                "company_ticker": "AMZN",
                "year": 2023,
                "quarter": None,
            },
            {
                "node_id": "3ccb9335-50ce-4121-bcde-1d3eab8c9004",
                "text": "Table\tof\tContents\nNet\tsales\tby\tgroups\tof\tsimilar\tproducts\tand\tservices,\twhich\talso\thave\tsimilar\teconomic\tcharacteristics,\tis\tas\tfollows\t(in\tmillions):\n\t\n\t\nYear\tEnded\tDecember\t31,\n\t\n2021\n2022\n2023\nNet\tSales:\nOnline\tstores\t(1)\n$\n222,075\n\t\n$\n220,004\n\t\n$\n231,872\n\t\nPhysical\tstores\t(2)\n17,075\n\t\n18,963\n\t\n20,030\n\t\nThird-party\tseller\tservices\t(3)\n103,366\n\t\n117,716\n\t\n140,053\n\t\nAdvertising\tservices\t(4)\n31,160\n\t\n37,739\n\t\n46,906\n\t\nSubscription\tservices\t(5)\n31,768\n\t\n35,218\n\t\n40,209\n\t\nAWS\n62,202\n\t\n80,096\n\t\n90,757\n\t\nOther\t(6)\n2,176\n\t\n4,247\n\t\n4,958\n\t\nConsolidated\n$\n469,822\n\t\n$\n513,983\n\t\n$\n574,785\n\t\n___________________\n(1)\nIncludes\tproduct\tsales\tand\tdigital\tmedia\tcontent\twhere\twe\trecord\trevenue\tgross.\tWe\tleverage\tour\tretail\tinfrastructure\tto\toffer\ta\twide\tselection\tof\tconsumable\tand\ndurable\tgoods\tthat\tincludes\tmedia\tproducts\tavailable\tin\tboth\ta\tphysical\tand\tdigital\tformat,\tsuch\tas\tbooks,\tvideos,\tgames,\tmusic,\tand\tsoftware.\tThese\tproduct\tsales\ninclude\tdigital\tproducts\tsold\ton\ta\ttransactional\tbasis.\tDigital\tmedia\tcontent\tsubscriptions\tthat\tprovide\tunlimited\tviewing\tor\tusage\trights\tare\tincluded\tin\n“Subscription\tservices.”\n(2)\nIncludes\tproduct\tsales\twhere\tour\tcustomers\tphysically\tselect\titems\tin\ta\tstore.\tSales\tto\tcustomers\twho\torder\tgoods\tonline\tfor\tdelivery\tor\tpickup\tat\tour\tphysical\nstores\tare\tincluded\tin\t“Online\tstores.”\n(3)\nIncludes\tcommissions\tand\tany\trelated\tfulfillment\tand\tshipping\tfees,\tand\tother\tthird-party\tseller\tservices.\n(4)\nIncludes\tsales\tof\tadvertising\tservices\tto\tsellers,\tvendors,\tpublishers,\tauthors,\tand\tothers,\tthrough\tprograms\tsuch\tas\tsponsored\tads,\tdisplay,\tand\tvideo\tadvertising.\n(5)\nIncludes\tannual\tand\tmonthly\tfees\tassociated\twith\tAmazon\tPrime\tmemberships,\tas\twell\tas\tdigital\tvideo,\taudiobook,\tdigital\tmusic,\te-book,\tand\tother\tnon-AWS\nsubscription\tservices.\n(6)\nIncludes\tsales\trelated\tto\tvarious\tother\tofferings,\tsuch\tas\tcertain\tlicensing\tand\tdistribution\tof\tvideo\tcontent,\thealth\tcare\tservices,\tand\tshipping\tservices,\tand\tour\tco-\nbranded\tcredit\tcard\tagreements.\nNet\tsales\tare\tattributed\tto\tcountries\tprimarily\tbased\ton\tcountry-focused\tonline\tand\tphysical\tstores\tor,\tfor\tAWS\tpurposes,\tthe\tselling\tentity.\t\nNet\tsales\tattributed\tto\ncountries\tthat\trepresent\ta\tsignificant\tportion\tof\tconsolidated\tnet\tsales\tare\tas\tfollows\t(in\tmillions):\n\t\nYear\tEnded\tDecember\t31,\n\t\n2021\n2022\n2023\nUnited\tStates\n$\n314,006\n\t\n$\n356,113\n\t\n$\n395,637\n\t\nGermany\n37,326\n\t\n33,598\n\t\n37,588\n\t\nUnited\tKingdom\n31,914\n\t\n30,074\n\t\n33,591\n\t\nJapan\n23,071\n\t\n24,396\n\t\n26,002\n\t\nRest\tof\tworld\n63,505\n\t\n69,802\n\t\n81,967\n\t\nConsolidated\n$\n469,822\n\t\n$\n513,983\n\t\n$\n574,785\n\t\n69",
                "source_num": 9,
                "page": "69",
                "url": "sec-edgar-filings/0001018724/10-K/0001018724-24-000008/primary-document.pdf",
                "doc_type": "10-K",
                "company_name": "Amazon.com, Inc.",
                "company_ticker": "AMZN",
                "year": 2023,
                "quarter": None,
            },
            {
                "node_id": "05b62ed4-e218-4e27-a27f-3822ae98ac50",
                "text": "This\tsegment\tincludes\texport\tsales\tfrom\tthese\tonline\tstores.\nInternational\nThe\tInternational\tsegment\tprimarily\tconsists\tof\tamounts\tearned\tfrom\tretail\tsales\tof\tconsumer\tproducts\t(including\tfrom\tsellers)\tand\tadvertising\tand\tsubscription\nservices\tthrough\tinternationally-focused\tonline\tstores.\tThis\tsegment\tincludes\texport\tsales\tfrom\tthese\tinternationally-focused\tonline\tstores\t(including\texport\tsales\tfrom\nthese\tonline\tstores\tto\tcustomers\tin\tthe\tU.S.,\tMexico,\tand\tCanada),\tbut\texcludes\texport\tsales\tfrom\tour\tNorth\tAmerica-focused\tonline\tstores.\nAWS\nThe\tAWS\tsegment\tconsists\tof\tamounts\tearned\tfrom\tglobal\tsales\tof\tcompute,\tstorage,\tdatabase,\tand\tother\tservices\tfor\tstart-ups,\tenterprises,\tgovernment\tagencies,\nand\tacademic\tinstitutions.\nInformation\ton\treportable\tsegments\tand\treconciliation\tto\tconsolidated\tnet\tincome\t(loss)\tis\tas\tfollows\t(in\tmillions):\n\t\n\t\nYear\tEnded\tDecember\t31,\n\t\n2021\n2022\n2023\nNorth\tAmerica\nNet\tsales\n$\n279,833\n\t\n$\n315,880\n\t\n$\n352,828\n\t\nOperating\texpenses\n272,562\n\t\n318,727\n\t\n337,951\n\t\nOperating\tincome\t(loss)\n$\n7,271\n\t\n$\n(\n2,847\n)\n$\n14,877\n\t\nInternational\nNet\tsales\n$\n127,787\n\t\n$\n118,007\n\t\n$\n131,200\n\t\nOperating\texpenses\n128,711\n\t\n125,753\n\t\n133,856\n\t\nOperating\tloss\n$\n(\n924\n)\n$\n(\n7,746\n)\n$\n(\n2,656\n)\nAWS\nNet\tsales\n$\n62,202\n\t\n$\n80,096\n\t\n$\n90,757\n\t\nOperating\texpenses\n43,670\n\t\n57,255\n\t\n66,126\n\t\nOperating\tincome\n$\n18,532\n\t\n$\n22,841\n\t\n$\n24,631\n\t\nConsolidated\nNet\tsales\n$\n469,822\n\t\n$\n513,983\n\t\n$\n574,785\n\t\nOperating\texpenses\n444,943\n\t\n501,735\n\t\n537,933\n\t\nOperating\tincome\n24,879\n\t\n12,248\n\t\n36,852\n\t\nTotal\tnon-operating\tincome\t(expense)\n13,272\n\t\n(\n18,184\n)\n705\n\t\nBenefit\t(provision)\tfor\tincome\ttaxes\n(\n4,791\n)\n3,217\n\t\n(\n7,120\n)\nEquity-method\tinvestment\tactivity,\tnet\tof\ttax\n4\n\t\n(\n3\n)\n(\n12\n)\nNet\tincome\t(loss)\n$\n33,364\n\t\n$\n(\n2,722\n)\n$\n30,425\n\t\n68",
                "source_num": 10,
                "page": "68",
                "url": "sec-edgar-filings/0001018724/10-K/0001018724-24-000008/primary-document.pdf",
                "doc_type": "10-K",
                "company_name": "Amazon.com, Inc.",
                "company_ticker": "AMZN",
                "year": 2023,
                "quarter": None,
            },
            {
                "node_id": "10504504-0ed2-4e0f-a511-d8607e66fd78",
                "text": "Table\tof\tContents\nvalue\tof\tthose\tinvestments\tbeing\twritten\tdown\tor\twritten\toff.\tIn\taddition,\tour\tsustainability\tinitiatives\tmay\tbe\tunsuccessful\tfor\ta\tvariety\tof\treasons,\tincluding\tif\twe\tare\nunable\tto\trealize\tthe\texpected\tbenefits\tof\tnew\ttechnologies\tor\tif\twe\tdo\tnot\tsuccessfully\tplan\tor\texecute\tnew\tstrategies,\twhich\tcould\tharm\tour\tbusiness\tor\tdamage\tour\nreputation.\nOur\tInternational\tOperations\tExpose\tUs\tto\ta\tNumber\tof\tRisks\nOur\tinternational\tactivities\tare\tsignificant\tto\tour\trevenues\tand\tprofits,\tand\twe\tplan\tto\tfurther\texpand\tinternationally.\tIn\tcertain\tinternational\tmarket\tsegments,\twe\nhave\trelatively\tlittle\toperating\texperience\tand\tmay\tnot\tbenefit\tfrom\tany\tfirst-to-market\tadvantages\tor\totherwise\tsucceed.\tIt\tis\tcostly\tto\testablish,\tdevelop,\tand\tmaintain\ninternational\toperations\tand\tstores,\tand\tpromote\tour\tbrand\tinternationally.\tOur\tinternational\toperations\tmay\tnot\tbecome\tprofitable\ton\ta\tsustained\tbasis.\nIn\taddition\tto\trisks\tdescribed\telsewhere\tin\tthis\tsection,\tour\tinternational\tsales\tand\toperations\tare\tsubject\tto\ta\tnumber\tof\trisks,\tincluding:\n•\nlocal\teconomic\tand\tpolitical\tconditions;\n•\ngovernment\tregulation\t(such\tas\tregulation\tof\tour\tproduct\tand\tservice\tofferings\tand\tof\tcompetition);\trestrictive\tgovernmental\tactions\t(such\tas\ttrade\tprotection\nmeasures,\tincluding\texport\tduties\tand\tquotas\tand\tcustom\tduties\tand\ttariffs,\tand\trestrictions\taround\tthe\timport\tand\texport\tof\tcertain\tproducts,\ttechnologies,\tand\ncomponents);\tnationalization;\tand\trestrictions\ton\tforeign\townership;\n•\nrestrictions\ton\tsales\tor\tdistribution\tof\tcertain\tproducts\tor\tservices\tand\tuncertainty\tregarding\tliability\tfor\tproducts,\tservices,\tand\tcontent,\tincluding\tuncertainty\nas\ta\tresult\tof\tless\tinternet-friendly\tlegal\tsystems,\tlocal\tlaws,\tlack\tof\tlegal\tprecedent,\tand\tvarying\trules,\tregulations,\tand\tpractices\tregarding\tthe\tphysical\tand\ndigital\tdistribution\tof\tmedia\tproducts\tand\tenforcement\tof\tintellectual\tproperty\trights;\n•\nbusiness\tlicensing\tor\tcertification\trequirements,\tsuch\tas\tfor\timports,\texports,\tweb\tservices,\tand\telectronic\tdevices;\n•\nlimitations\ton\tthe\trepatriation\tand\tinvestment\tof\tfunds\tand\tforeign\tcurrency\texchange\trestrictions;\n•\nlimited\tfulfillment\tand\ttechnology\tinfrastructure;\n•\nshorter\tpayable\tand\tlonger\treceivable\tcycles\tand\tthe\tresultant\tnegative\timpact\ton\tcash\tflow;\n•\nlaws\tand\tregulations\tregarding\tprivacy,\tdata\tuse,\tdata\tprotection,\tdata\tsecurity,\tdata\tlocalization,\tnetwork\tsecurity,\tconsumer\tprotection,\tpayments,\nadvertising,\tand\trestrictions\ton\tpricing\tor\tdiscounts;\n•\nlower\tlevels\tof\tuse\tof\tthe\tinternet;\n•\nlower\tlevels\tof\tconsumer\tspending\tand\tfewer\topportunities\tfor\tgrowth\tcompared\tto\tthe\tU.S.;\n•\nlower\tlevels\tof\tcredit\tcard\tusage\tand\tincreased\tpayment\trisk;\n•\ndifficulty\tin\tstaffing,\tdeveloping,\tand\tmanaging\tforeign\toperations\tas\ta\tresult\tof\tdistance,\tlanguage,\tand\tcultural\tdifferences;\n•\ndifferent\temployee/employer\trelationships\tand\tthe\texistence\tof\tworks\tcouncils\tand\tlabor\tunions;\n•\ncompliance\twith\tthe\tU.S.\tForeign\tCorrupt\tPractices\tAct\tand\tother\tapplicable\tU.S.\tand\tforeign\tlaws\tprohibiting\tcorrupt\tpayments\tto\tgovernment\tofficials\tand\nother\tthird\tparties;\n•\nlaws\tand\tpolicies\tof\tthe\tU.S.\tand\tother\tjurisdictions\taffecting\ttrade,\tforeign\tinvestment,\tloans,\tand\ttaxes;\tand\n•\ngeopolitical\tevents,\tincluding\twar\tand\tterrorism.",
                "source_num": 11,
                "page": "7",
                "url": "sec-edgar-filings/0001018724/10-K/0001018724-24-000008/primary-document.pdf",
                "doc_type": "10-K",
                "company_name": "Amazon.com, Inc.",
                "company_ticker": "AMZN",
                "year": 2023,
                "quarter": None,
            },
            {
                "node_id": "a52eb6aa-5dbc-49c4-b894-0652f0140962",
                "text": "Table\tof\tContents\nCompetition\nOur\tbusinesses\tencompass\ta\tlarge\tvariety\tof\tproduct\ttypes,\tservice\tofferings,\tand\tdelivery\tchannels.\tThe\tworldwide\tmarketplace\tin\twhich\twe\tcompete\tis\tevolving\nrapidly\tand\tintensely\tcompetitive,\tand\twe\tface\ta\tbroad\tarray\tof\tcompetitors\tfrom\tmany\tdifferent\tindustry\tsectors\taround\tthe\tworld.\tOur\tcurrent\tand\tpotential\ncompetitors\tinclude:\t(1)\tphysical,\te-commerce,\tand\tomnichannel\tretailers,\tpublishers,\tvendors,\tdistributors,\tmanufacturers,\tand\tproducers\tof\tthe\tproducts\twe\toffer\tand\nsell\tto\tconsumers\tand\tbusinesses;\t(2)\tpublishers,\tproducers,\tand\tdistributors\tof\tphysical,\tdigital,\tand\tinteractive\tmedia\tof\tall\ttypes\tand\tall\tdistribution\tchannels;\t(3)\tweb\nsearch\tengines,\tcomparison\tshopping\twebsites,\tsocial\tnetworks,\tweb\tportals,\tand\tother\tonline\tand\tapp-based\tmeans\tof\tdiscovering,\tusing,\tor\tacquiring\tgoods\tand\nservices,\teither\tdirectly\tor\tin\tcollaboration\twith\tother\tretailers;\t(4)\tcompanies\tthat\tprovide\te-commerce\tservices,\tincluding\twebsite\tdevelopment\tand\thosting,\nomnichannel\tsales,\tinventory\tand\tsupply\tchain\tmanagement,\tadvertising,\tfulfillment,\tcustomer\tservice,\tand\tpayment\tprocessing;\t(5)\tcompanies\tthat\tprovide\tfulfillment\nand\tlogistics\tservices\tfor\tthemselves\tor\tfor\tthird\tparties,\twhether\tonline\tor\toffline;\t(6)\tcompanies\tthat\tprovide\tinformation\ttechnology\tservices\tor\tproducts,\tincluding\ton-\npremises\tor\tcloud-based\tinfrastructure\tand\tother\tservices;\t(7)\tcompanies\tthat\tdesign,\tmanufacture,\tmarket,\tor\tsell\tconsumer\telectronics,\ttelecommunication,\tand\nelectronic\tdevices;\t(8)\tcompanies\tthat\tsell\tgrocery\tproducts\tonline\tand\tin\tphysical\tstores;\tand\t(9)\tcompanies\tthat\tprovide\tadvertising\tservices,\twhether\tin\tdigital\tor\tother\nformats.\tWe\tbelieve\tthat\tthe\tprincipal\tcompetitive\tfactors\tin\tour\tretail\tbusinesses\tinclude\tselection,\tprice,\tand\tconvenience,\tincluding\tfast\tand\treliable\tfulfillment.\nAdditional\tcompetitive\tfactors\tfor\tour\tseller\tand\tenterprise\tservices\tinclude\tthe\tquality,\tspeed,\tand\treliability\tof\tour\tservices\tand\ttools,\tas\twell\tas\tcustomers’\tability\tand\nwillingness\tto\tchange\tbusiness\tpractices.\tSome\tof\tour\tcurrent\tand\tpotential\tcompetitors\thave\tgreater\tresources,\tlonger\thistories,\tmore\tcustomers,\tgreater\tbrand\nrecognition,\tand\tgreater\tcontrol\tover\tinputs\tcritical\tto\tour\tvarious\tbusinesses.\tThey\tmay\tsecure\tbetter\tterms\tfrom\tsuppliers,\tadopt\tmore\taggressive\tpricing,\tpursue\nrestrictive\tdistribution\tagreements\tthat\trestrict\tour\taccess\tto\tsupply,\tdirect\tconsumers\tto\ttheir\town\tofferings\tinstead\tof\tours,\tlock-in\tpotential\tcustomers\twith\trestrictive\nterms,\tand\tdevote\tmore\tresources\tto\ttechnology,\tinfrastructure,\tfulfillment,\tand\tmarketing.\tThe\tinternet\tfacilitates\tcompetitive\tentry\tand\tcomparison\tshopping,\twhich\nenhances\tthe\tability\tof\tnew,\tsmaller,\tor\tlesser-known\tbusinesses\tto\tcompete\tagainst\tus.\tEach\tof\tour\tbusinesses\tis\talso\tsubject\tto\trapid\tchange\tand\tthe\tdevelopment\tof\nnew\tbusiness\tmodels\tand\tthe\tentry\tof\tnew\tand\twell-funded\tcompetitors.\tOther\tcompanies\talso\tmay\tenter\tinto\tbusiness\tcombinations\tor\talliances\tthat\tstrengthen\ttheir\ncompetitive\tpositions.",
                "source_num": 12,
                "page": "4",
                "url": "sec-edgar-filings/0001018724/10-K/0001018724-24-000008/primary-document.pdf",
                "doc_type": "10-K",
                "company_name": "Amazon.com, Inc.",
                "company_ticker": "AMZN",
                "year": 2023,
                "quarter": None,
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
