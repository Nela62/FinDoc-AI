import OpenAI from 'openai';

export class API {
  public static uploadImage = async () => {
    await new Promise((r) => setTimeout(r, 500));
    return '/placeholder-image.jpg';
  };
}

export async function moderation(input: string) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const moderation = await openai.moderations.create({
    input,
  });

  console.log(moderation);
  return moderation;
}

export function cleanInput(input: string) {
  // remove delimeter characters
}

export async function checkOutput(input: string) {
  //   system_message = f"""
  // You are an assistant that evaluates whether \
  // customer service agent responses sufficiently \
  // answer customer questions, and also validates that \
  // all the facts the assistant cites from the product \
  // information are correct.
  // The product information and user and customer \
  // service agent messages will be delimited by \
  // 3 backticks, i.e. ```.
  // Respond with a Y or N character, with no punctuation:
  // Y - if the output sufficiently answers the question \
  // AND the response correctly uses product information
  // N - otherwise
  // Output a single letter only.
  // """
  // customer_message = f"""
  // tell me about the smartx pro phone and \
  // the fotosnap camera, the dslr one. \
  // Also tell me about your tvs"""
  // product_information = """{ "name": "SmartX ProPhone", "category": "Smartphones and Accessories", "brand": "SmartX", "model_number": "SX-PP10", "warranty": "1 year", "rating": 4.6, "features": [ "6.1-inch display", "128GB storage", "12MP dual camera", "5G" ], "description": "A powerful smartphone with advanced camera features.", "price": 899.99 } { "name": "FotoSnap DSLR Camera", "category": "Cameras and Camcorders", "brand": "FotoSnap", "model_number": "FS-DSLR200", "warranty": "1 year", "rating": 4.7, "features": [ "24.2MP sensor", "1080p video", "3-inch LCD", "Interchangeable lenses" ], "description": "Capture stunning photos and videos with this versatile DSLR camera.", "price": 599.99 } { "name": "CineView 4K TV", "category": "Televisions and Home Theater Systems", "brand": "CineView", "model_number": "CV-4K55", "warranty": "2 years", "rating": 4.8, "features": [ "55-inch display", "4K resolution", "HDR", "Smart TV" ], "description": "A stunning 4K TV with vibrant colors and smart features.", "price": 599.99 } { "name": "SoundMax Home Theater", "category": "Televisions and Home Theater Systems", "brand": "SoundMax", "model_number": "SM-HT100", "warranty": "1 year", "rating": 4.4, "features": [ "5.1 channel", "1000W output", "Wireless subwoofer", "Bluetooth" ], "description": "A powerful home theater system for an immersive audio experience.", "price": 399.99 } { "name": "CineView 8K TV", "category": "Televisions and Home Theater Systems", "brand": "CineView", "model_number": "CV-8K65", "warranty": "2 years", "rating": 4.9, "features": [ "65-inch display", "8K resolution", "HDR", "Smart TV" ], "description": "Experience the future of television with this stunning 8K TV.", "price": 2999.99 } { "name": "SoundMax Soundbar", "category": "Televisions and Home Theater Systems", "brand": "SoundMax", "model_number": "SM-SB50", "warranty": "1 year", "rating": 4.3, "features": [ "2.1 channel", "300W output", "Wireless subwoofer", "Bluetooth" ], "description": "Upgrade your TV's audio with this sleek and powerful soundbar.", "price": 199.99 } { "name": "CineView OLED TV", "category": "Televisions and Home Theater Systems", "brand": "CineView", "model_number": "CV-OLED55", "warranty": "2 years", "rating": 4.7, "features": [ "55-inch display", "4K resolution", "HDR", "Smart TV" ], "description": "Experience true blacks and vibrant colors with this OLED TV.", "price": 1499.99 }"""
  // q_a_pair = f"""
  // Customer message: ```{customer_message}```
  // Product information: ```{product_information}```
  // Agent response: ```{final_response_to_customer}```
  // Does the response use the retrieved information correctly?
  // Does the response sufficiently answer the question
  // Output Y or N
  // """
  // messages = [
  //     {'role': 'system', 'content': system_message},
  //     {'role': 'user', 'content': q_a_pair}
  // ]
  // response = get_completion_from_messages(messages, max_tokens=1)
  // print(response)
  //   another_response = "life is like a box of chocolates"
  // q_a_pair = f"""
  // Customer message: ```{customer_message}```
  // Product information: ```{product_information}```
  // Agent response: ```{another_response}```
  // Does the response use the retrieved information correctly?
  // Does the response sufficiently answer the question?
  // Output Y or N
  // """
  // messages = [
  //     {'role': 'system', 'content': system_message},
  //     {'role': 'user', 'content': q_a_pair}
  // ]
  // response = get_completion_from_messages(messages)
  // print(response)
}

// def process_user_message(user_input, all_messages, debug=True):
//     delimiter = "```"

//     # Step 1: Check input to see if it flags the Moderation API or is a prompt injection
//     response = openai.Moderation.create(input=user_input)
//     moderation_output = response["results"][0]

//     if moderation_output["flagged"]:
//         print("Step 1: Input flagged by Moderation API.")
//         return "Sorry, we cannot process this request."

//     if debug: print("Step 1: Input passed moderation check.")

//     category_and_product_response = utils.find_category_and_product_only(user_input, utils.get_products_and_category())
//     #print(print(category_and_product_response)
//     # Step 2: Extract the list of products
//     category_and_product_list = utils.read_string_to_list(category_and_product_response)
//     #print(category_and_product_list)

//     if debug: print("Step 2: Extracted list of products.")

//     # Step 3: If products are found, look them up
//     product_information = utils.generate_output_string(category_and_product_list)
//     if debug: print("Step 3: Looked up product information.")

//     # Step 4: Answer the user question
//     system_message = f"""
//     You are a customer service assistant for a large electronic store. \
//     Respond in a friendly and helpful tone, with concise answers. \
//     Make sure to ask the user relevant follow-up questions.
//     """
//     messages = [
//         {'role': 'system', 'content': system_message},
//         {'role': 'user', 'content': f"{delimiter}{user_input}{delimiter}"},
//         {'role': 'assistant', 'content': f"Relevant product information:\n{product_information}"}
//     ]

//     final_response = get_completion_from_messages(all_messages + messages)
//     if debug:print("Step 4: Generated response to user question.")
//     all_messages = all_messages + messages[1:]

//     # Step 5: Put the answer through the Moderation API
//     response = openai.Moderation.create(input=final_response)
//     moderation_output = response["results"][0]

//     if moderation_output["flagged"]:
//         if debug: print("Step 5: Response flagged by Moderation API.")
//         return "Sorry, we cannot provide this information."

//     if debug: print("Step 5: Response passed moderation check.")

//     # Step 6: Ask the model if the response answers the initial user query well
//     user_message = f"""
//     Customer message: {delimiter}{user_input}{delimiter}
//     Agent response: {delimiter}{final_response}{delimiter}

//     Does the response sufficiently answer the question?
//     """
//     messages = [
//         {'role': 'system', 'content': system_message},
//         {'role': 'user', 'content': user_message}
//     ]
//     evaluation_response = get_completion_from_messages(messages)
//     if debug: print("Step 6: Model evaluated the response.")

//     # Step 7: If yes, use this answer; if not, say that you will connect the user to a human
//     if "Y" in evaluation_response:  # Using "in" instead of "==" to be safer for model output variation (e.g., "Y." or "Yes")
//         if debug: print("Step 7: Model approved the response.")
//         return final_response, all_messages
//     else:
//         if debug: print("Step 7: Model disapproved the response.")
//         neg_str = "I'm unable to provide the information you're looking for. I'll connect you with a human representative for further assistance."
//         return neg_str, all_messages

// user_input = "tell me about the smartx pro phone and the fotosnap camera, the dslr one. Also what tell me about your tvs"
// response,_ = process_user_message(user_input,[])
// print(response)
