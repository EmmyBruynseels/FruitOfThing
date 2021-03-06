@extends('layouts.app')

@section('content')
    <div class="container-fluid">
        <div class="row">
            <div id="div_side" class="col-md-4 d-none d-md-block">
                <div class="content-title text-center">
                    <h5>Weer &amp; temperatuur vandaag</h5>
                </div>
                <div id="weather-info">
                    <div id="buienradar-info">
                        <a href="http://www.buienradar.be" target="_blank">
                            <img src="http://api.buienradar.nl/image/1.0/radarmapbe" class="img-fluid w-100">
                        </a>
                    </div>
                    <div id="kmi-info">
                        <iframe
                            src="https://www.meteo.be/services/widget/?postcode=3800&nbDay=2&type=4&lang=nl&bgImageId=1&bgColor=567cd2&scrolChoice=0&colorTempMax=A5D6FF&colorTempMin=ffffff"></iframe>
                    </div>
                </div>
            </div>

            <div id="div_main" class="col-md-8 col-sm-12">
                <div class="content-title text-center">
                    <h5>Grafieken en statistieken</h5>
                </div>

                <div class="row">
                    <div class="col-sm-6 col-lg-3 form-group">
                        <label for="fruit_type">Vruchtsoort</label>
                        <select id="fruit_type" class="form-control">
                            @foreach($fruit_types as $fruit_type)
                                <option value="{{ $fruit_type->id }}">{{ $fruit_type->name }}</option>
                            @endforeach
                        </select>
                    </div>
                    <div class="col-sm-6 col-lg-3 form-group">
                        <label for="display">Weergave</label>
                        <select id="display" class="form-control">
                            <option value="H">Uur</option>
                            <option value="d">Dag</option>
                            <option value="W">Week</option>
                            <option selected value="m">Maand</option>
                            <option value="Y">Jaar</option>
                        </select>
                    </div>
                    <div class="col-sm-6 col-lg-3 form-group">
                        <label for="start_date">Begindatum</label>
                        <input type="date" id="start_date" placeholder="Selecteer begindatum" value="{{ date('Y-m-d', strtotime(date('Y-m-d') . ' -1 year')) }}" class="form-control">
                    </div>
                    <div class="col-sm-6 col-lg-3 form-group">
                        <label for="end_date">Einddatum</label>
                        <input type="date" id="end_date" placeholder="Selecteer einddatum" value="{{ date('Y-m-d') }}" class="form-control">
                    </div>
                    <!--Graph-->
                    <div class="position-absolute overlay">
                        <div class="w-100 d-flex justify-content-center align-items-center">
                            <div class="spinner d-flex m-auto position-absolute"></div>
                        </div>
                    </div>
                    <div id="graph" class="col-12"></div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="container-fluid">
                <div class="content-title text-center">
                    <h5>Overzicht metingen</h5>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col">
                <!--Table-->
                <div class="position-absolute overlay">
                    <div class="w-100 d-flex justify-content-center align-items-center">
                        <div class="spinner d-flex m-auto position-absolute"></div>
                    </div>
                </div>
                <div id="table"></div>
            </div>
        </div>
    </div>
@endsection

@section('script')
    <script>
        function update_graph() {
            $.ajaxSetup({
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="_token"]').attr('content')
                }
            });
            $.ajax({
                type: 'get',
                url: '{{ route('graph.index') }}',
                data: {fruit_type: $('#fruit_type').val(), display: $('#display').val(), start_date: $('#start_date').val(), end_date: $('#end_date').val()},
                success: function (response) {
                    $("#graph").html(response);
                },
                error: function (request, status, error) {
                    $("#graph").html('<p>De grafiek kon niet worden weergegeven... Probeer het later opnieuw</p>');
                }
            });
        }

        function update_table(page = 1) {
            $.ajax({
                type: 'get',
                url: '{{ route('table.index') }}?page=' + page,
                data: {_token: $('meta[name="csrf-token"]').attr('content'), fruit_type: $('#fruit_type').val(), start_date: $('#start_date').val(), end_date: $('#end_date').val()},
                success: function (response) {
                    $("#table").html(response);
                },
                error: function (request, status, error) {
                    $("#table").html('<p>De tabel kon niet worden weergegeven... Probeer het later opnieuw</p>');
                }
            });
        }

        $(document).ready(function () {
            //init
            update_graph();
            update_table();

            //onChange
            $("select, input[type='date']").change(function () {
                update_graph();
                update_table();
            });

            //enable ajax loading on pagination click
            $(document).on('click', '.pagination a', function (e) {
                e.preventDefault();

                $('li').removeClass('active');
                $(this).parent('li').addClass('active');

                var myurl = $(this).attr('href');
                var page = $(this).attr('href').split('page=')[1];

                update_table(page);
            });

            //Ajax loading
            $(document).ajaxStart(function () {
                $('.overlay').show();
            });

            $(document).ajaxComplete(function () {
                $('.overlay').hide();
            });
        });
    </script>
@endsection
