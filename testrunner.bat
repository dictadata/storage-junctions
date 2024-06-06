REM Run tasks from launch.json where "program" includes LAUNCH_PROGRAM
REM and "name" includes %1 argument, if defined.
REM st_launcher is a node.js bin script in @dictadata/storage-junctions project.
SET NODE_ENV=development
SET LOG_LEVEL=verbose
SET LAUNCH_PROGRAM=/test/
st_launcher %1
