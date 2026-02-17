from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(["GET"])
def api_root(request):
    # Moodle app API root. Add endpoints here as you build them.
    return Response({"moodle": "ok"})
