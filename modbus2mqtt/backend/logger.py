import logging
import sys
Logger: logging.Logger = logging.getLogger("console")
Logger.addHandler(logging.StreamHandler(sys.stdout))
Logger.setLevel(logging.INFO)