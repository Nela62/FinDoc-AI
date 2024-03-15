from anthropic import Anthropic
import re


def construct_format_tool_for_claude_prompt(name, description, parameters):
    constructed_prompt = (
        "<tool_description>\n"
        f"<tool_name>{name}</tool_name>\n"
        "<description>\n"
        f"{description}\n"
        "</description>\n"
        "<parameters>\n"
        f"{construct_format_parameters_prompt(parameters)}\n"
        "</parameters>\n"
        "</tool_description>"
    )
    return constructed_prompt


def construct_format_parameters_prompt(parameters):
    constructed_prompt = "\n".join(
        f"<parameter>\n<name>{parameter['name']}</name>\n<type>{parameter['type']}</type>\n<description>{parameter['description']}</description>\n</parameter>"
        for parameter in parameters
    )

    return constructed_prompt


async def get_reports_engine() -> d:
    client = Anthropic()
    model_name = "claude-3-opus-20240229"

    message = (
        client.messages.create(
            model=model_name,
            max_tokens=1024,
            messages=[
                {
                    "role": "user",
                    "content": "I need a report on the sales of the last quarter.",
                }
            ],
        )
        .content[0]
        .text
    )
    print(message)
