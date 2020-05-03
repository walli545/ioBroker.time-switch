[Für die deutsche Version, clicke hier](doc/Setup.de.md)
[Go back to README](README.md)

# How to setup a on/off schedule

  1. Install the adapter and create an instance (one instance can handle many schedules) 
  2. Go to the instance settings and click "Add on/off schedule" to create a new schedule (one schedule can switch one to ten ioBroker states).
     
     Keep the schedule data id of the newly created schedule in mind, we will need that later.
      
     The admin interface is only for adding or deleting schedules and shows basic information of the schedule (it's name, how much triggers it has and whether it is enabled).
     
     Now safe the changes and leave the instance settings. 
  3. Now go to the vis editor and open the view where the schedule should be visible.
     Create a new "Schedule (On/Off)" widget (can be found in category "time-switch) and adjust it's size and position to fit your layout.
  4. Now configure the widget with the following properties found under the "Common" attributes:
   
     - Schedule data id: Open the select OID dialog and select the schedule data id that you remembered earlier. It can be found under "time-switch.0".
     - Show switched id: Shows or hides the switched state's id. This takes effect only when one state is switched, because for multiple
        states it is hidden anyway.
     - Show manual switch: Shows or hides a manual switch for the switched state. For a single switched state it also shows
        the current value. For multiple states it is set only.
     - Value type: The value type of the switched states. Can be boolean/string/number.
     - Value for off/Value for on: Values that should be switched for on or off. Possible values depend on the selected
        value type:
        
       - boolean: not used and can be left empty (for boolean it's always true or false)
       - number: values must be parsable by the Javascript function Number.parseFloat()
       - string: Not empty
     - Count of switched states: Select how many states should be switched by the schedule.
     - Switched state id[1-10]: Select the ids of the states that should be switched by the schedule, e.g. on/off status of a wall plug. If multiple states
        are to be switched, the must be of the same type (e.g. value type and on/off values).
  5. Everything else can be configured in the view part of the widget.
   
     - Enable/Disable automatic switching
     - Change the name of the schedule
     - Change the current value of the states
     - Add/Delete/Edit actions
