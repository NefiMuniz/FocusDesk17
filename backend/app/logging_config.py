import json
import os
from datetime import datetime, timezone
from pathlib import Path


class SecurityLogger:
  def __init__(self, logs_dir: str = "logs"):
    self.logs_dir = logs_dir
    self._ensure_logs_dir()

  def _ensure_logs_dir(self):
    Path(self.logs_dir).mkdir(exist_ok=True)

  def _log_event(self, event_type: str, user_id: str = None, ip_address: str = None, details: dict = None):
    log_entry = {
      "timestamp": datetime.now(timezone.utc).isoformat(),
      "event_type": event_type,
      "user_id": user_id,
      "ip_address": ip_address,
      "details": details or {},
    }

    today = datetime.now(timezone.utc).date()
    log_file = os.path.join(self.logs_dir, f"security_{today}.log")

    with open(log_file, "a", encoding="utf-8") as f:
      f.write(json.dumps(log_entry) + "\n")

  def log_failed_login(self, email: str, ip_address: str):
    self._log_event(
      event_type="failed_login",
      ip_address=ip_address,
      details={"email": email}
    )

  def log_successful_login(self, user_id: str, ip_address: str):
    self._log_event(
      event_type="successful_login",
      user_id=user_id,
      ip_address=ip_address
    )

  def log_email_changed(self, user_id: str, old_email: str, new_email: str, ip_address: str):
    self._log_event(
      event_type="email_changed",
      user_id=user_id,
      ip_address=ip_address,
      details={"old_email": old_email, "new_email": new_email}
    )

  def log_board_deleted(self, user_id: str, board_id: str, board_name: str, ip_address: str):
    self._log_event(
      event_type="board_deleted",
      user_id=user_id,
      ip_address=ip_address,
      details={"board_id": board_id, "board_name": board_name}
    )

security_logger = SecurityLogger()

