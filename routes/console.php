<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('community:notify')->everyMinute()->withoutOverlapping();
