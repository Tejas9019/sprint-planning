import logging
import sys


def setup_logging():
    # Setup logger root format
    formatter = logging.Formatter(
        fmt="[%(asctime)s] %(levelname)s [%(name)s:%(lineno)d] - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    # Standard out handler
    stdout_handler = logging.StreamHandler(sys.stdout)
    stdout_handler.setFormatter(formatter)

    # Get root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)

    # Remove existing handlers to prevent duplicates
    if root_logger.handlers:
        for handler in root_logger.handlers[:]:
            root_logger.removeHandler(handler)

    root_logger.addHandler(stdout_handler)

    # Specific configurations for library loggers if desired
    logging.getLogger("uvicorn.access").setLevel(
        logging.WARNING
    )  # Minimize duplicated HTTP logs if we log custom ones
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
