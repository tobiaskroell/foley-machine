"""
@author: Kevin\n
"""
import logging
import os

from yolov5.detect import print_dict, detect_objects

# Dict for testing the print_dict function
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

# Dict for testing the detect_objects function
alan_dict = {
    'detections': [
        {'150': [{'object': 'giraffe', 'count': '2'}]},
        {'300': [{'object': 'giraffe', 'count': '1'}]},
        {'600': [{'object': 'bird', 'count': '2'}]},
        {'1350': [{'object': 'bird', 'count': '1'}]}
    ]
}

def test_print_dict():
    """
    @author: Kevin\n
    """
    print_dict(mock_dict_printing)
    assert True


def test_detect_objects():
    """
    @author: Kevin\n
    """
    try:
        # Change directory to yolov5
        if not os.getcwd().endswith("yolov5"):
            os.chdir(os.getcwd() + "/yolov5/")
        detect_objects('../../node_server/public/video/alan.mp4')
        assert True
    except Exception as e:
        logging.error('Error in test_detect_objects: ' + str(e))
        assert False
