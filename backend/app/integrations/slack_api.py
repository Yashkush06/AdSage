"""No-op Slack client — removed for hackathon build"""


class SlackClient:
    async def send_message(self, text: str, blocks=None) -> bool:
        return False

    async def notify_approval_needed(self, *args, **kwargs) -> bool:
        return False

    async def notify_action_executed(self, *args, **kwargs) -> bool:
        return False
