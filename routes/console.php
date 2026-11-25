<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('assessments:expire')->everyMinute()->withoutOverlapping();
Schedule::command('community:notify')->everyMinute()->withoutOverlapping();
