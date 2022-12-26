"""
@author: Kevin
"""

import logging
import os
import sys
import unittest
from pathlib import Path

FILE = Path(__file__).resolve()
ROOT = FILE.parents[1]  # get root directory
if str(ROOT) not in sys.path:
    sys.path.append(str(ROOT))  # add ROOT to PATH
ROOT = Path(os.path.relpath(ROOT, Path.cwd()))  # relative

from yolov5.detect import print_dict, detect_objects


class TestDetectObjects(unittest.TestCase):
    """
    @author: Kevin
    """
    def test_detect_objects_invalid_source(self):
        """
        Test that the function raises a ValueError when given an invalid input for the source parameter
        """
        source = '/invalid/path/to/file.jpg'
        conf_thres = 0.5
        with self.assertRaises(ValueError):
            detect_objects(source, conf_thres)

    def test_detect_objects(self):
        """
        Test that the function correctly processes a video file and returns the expected detections as a dict
        """
        alan_dict = {
            'detections': [
                {'150': [{'object': 'giraffe', 'count': '2'}]},
                {'300': [{'object': 'giraffe', 'count': '1'}]},
                {'600': [{'object': 'bird', 'count': '2'}]},
                {'1350': [{'object': 'bird', 'count': '1'}]}
            ]
        }

        source = '../../node_server/public/video/alan.mp4'
        detections_dict = detect_objects(source, conf_thres=0.5)

        self.assertIsInstance(detections_dict, dict)
        self.assertEquals(detections_dict, alan_dict)

    def test_detect_objects_invalid_conf_thres(self):
        """
        Test that the function raises a ValueError when given an invalid input for the conf_thres parameter
        """
        source = 'path/to/file.jpg'

        with self.assertRaises(ValueError):
            detect_objects(source, conf_thres=1.5)


class TestPrintDict(unittest.TestCase):
    """
    @author: Kevin
    """
    def test_print_dict(self):
        """
        Test print_dict function
        """
        mock_dict_printing = {
            'detections': [
                {'150': [{'object': 'dog', 'count': '3'}]},
                {'300': [{'object': 'cat', 'count': '2'},
                         {'object': 'bed', 'count': '1'}]},
                {'450': [{'object': 'dog', 'count': '2'}]},
                {'600': [{'object': 'cat', 'count': '1'},
                         {'object': 'dog', 'count': '1'},
                         {'object': 'bed', 'count': '1'}]},
                {'750': [{'object': 'cat', 'count': '1'},
                         {'object': 'dog', 'count': '1'},
                         {'object': 'bed', 'count': '1'}]},
                {'1050': [{'object': 'cat', 'count': '1'},
                          {'object': 'dog', 'count': '1'}]},
            ]
        }
        try:
            print_dict(mock_dict_printing)
            assert True
        except Exception as e:
            logging.error('Error in test_print_dict: ' + str(e))
            assert False


if __name__ == '__main__':
    unittest.main()
